import type {
  CardDefinition,
  LaneIndex,
  MatchState,
  RuntimeModifier,
  TargetSelector,
  UnitState,
} from "../domain";
import {
  changeSignal,
  drawCards,
  getOpponent,
  getPlayer,
  getPlayerIndex,
  replacePlayer,
  updatePlayer,
} from "./match";
import {
  addPlayerModifier,
  addUnitModifier,
  exileCard,
  getPlayerModifiers,
  getRuntimeCounter,
  getUnitModifiers,
  incrementRuntimeCounter,
  markModifierUsedThisTurn,
  removePlayerModifiers,
  removeUnitModifiers,
  setRuntimeCounter,
} from "./runtime-state";

export type RuntimeTargetBindings = Partial<Record<TargetSelector, readonly string[]>>;

export interface RuntimeChoiceBindings {
  /** Named card choices from hand/deck/discard. Values are definition ids. */
  cards?: Readonly<Record<string, readonly string[]>>;
  /** Named discrete choices such as ATTACK/DEFENSE, CONTROOLZ/COMMAND or YES/NO. */
  modes?: Readonly<Record<string, string>>;
  /** Named numeric allocations, e.g. distributed DEF. */
  numbers?: Readonly<Record<string, number>>;
}

export interface Set001RuntimeContext {
  sourcePlayerId: string;
  sourceUnitId?: string;
  targets?: RuntimeTargetBindings;
  choices?: RuntimeChoiceBindings;
}

export interface Set001RuntimePending {
  cardId: string;
  sourcePlayerId: string;
  sourceUnitId?: string;
  trigger: "CONNECTION" | "DISCONNECTION" | "PASSIVE" | "ON_ATTACK" | "ON_DAMAGE" | "TURN_START" | "TURN_END" | "COMMAND_RESOLVE";
  text: string;
  reason: "TARGET_REQUIRED" | "DECISION_REQUIRED" | "UNSUPPORTED_ACTION";
  requiredTarget?: TargetSelector;
  decisionKey?: string;
}

export interface Set001RuntimeResult {
  state: MatchState;
  pendingEffects: readonly Set001RuntimePending[];
}

export interface Set001RuntimeCallbacks {
  damageUnit: (
    state: MatchState,
    matchUnitId: string,
    amount: number,
    targets?: RuntimeTargetBindings,
    choices?: RuntimeChoiceBindings,
  ) => Set001RuntimeResult;
  disconnectUnit: (
    state: MatchState,
    matchUnitId: string,
    targets?: RuntimeTargetBindings,
    choices?: RuntimeChoiceBindings,
  ) => Set001RuntimeResult;
  resolveConnection: (
    state: MatchState,
    definitionId: string,
    sourcePlayerId: string,
    sourceUnitId: string,
    targets?: RuntimeTargetBindings,
    choices?: RuntimeChoiceBindings,
  ) => Set001RuntimeResult;
}

interface UnitLocation {
  playerIndex: 0 | 1;
  lane: LaneIndex;
  unit: UnitState;
}

function findUnit(state: MatchState, matchUnitId: string): UnitLocation | null {
  for (const playerIndex of [0, 1] as const) {
    for (const lane of [0, 1, 2] as const) {
      const unit = state.players[playerIndex].board[lane];
      if (unit?.matchUnitId === matchUnitId) return { playerIndex, lane, unit };
    }
  }
  return null;
}

function allUnits(state: MatchState): UnitLocation[] {
  const result: UnitLocation[] = [];
  for (const playerIndex of [0, 1] as const) {
    for (const lane of [0, 1, 2] as const) {
      const unit = state.players[playerIndex].board[lane];
      if (unit) result.push({ playerIndex, lane, unit });
    }
  }
  return result;
}

function replaceUnit(state: MatchState, location: UnitLocation, unit: UnitState | null): MatchState {
  const player = state.players[location.playerIndex];
  const board = [...player.board] as [UnitState | null, UnitState | null, UnitState | null];
  board[location.lane] = unit;
  return replacePlayer(state, location.playerIndex, { ...player, board });
}

function cardById(catalogue: readonly CardDefinition[], definitionId: string): CardDefinition {
  const card = catalogue.find((item) => item.id === definitionId);
  if (!card) throw new Error(`Carta desconhecida no runtime SET001: ${definitionId}`);
  return card;
}

function pending(
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  reason: Set001RuntimePending["reason"],
  extra: Partial<Pick<Set001RuntimePending, "requiredTarget" | "decisionKey">> = {},
): Set001RuntimePending {
  return {
    cardId: runtimeId.split(":")[0],
    sourcePlayerId: context.sourcePlayerId,
    sourceUnitId: context.sourceUnitId,
    trigger,
    text,
    reason,
    ...extra,
  };
}

function selectedUnit(
  state: MatchState,
  context: Set001RuntimeContext,
  selector: TargetSelector,
): UnitLocation | null {
  const id = context.targets?.[selector]?.[0];
  if (!id) return null;
  const found = findUnit(state, id);
  if (!found) return null;
  const sourceIndex = getPlayerIndex(state, context.sourcePlayerId);
  if (selector === "ALLY_CONTROOLZ" && found.playerIndex !== sourceIndex) return null;
  if (selector === "OTHER_ALLY_CONTROOLZ") {
    if (found.playerIndex !== sourceIndex || found.unit.matchUnitId === context.sourceUnitId) return null;
  }
  if (selector === "ENEMY_CONTROOLZ" && found.playerIndex === sourceIndex) return null;
  return found;
}

function selectedUnits(
  state: MatchState,
  context: Set001RuntimeContext,
  selector: TargetSelector,
): UnitLocation[] {
  const ids = context.targets?.[selector] ?? [];
  return ids
    .map((id) => findUnit(state, id))
    .filter((entry): entry is UnitLocation => Boolean(entry));
}

function modifyPermanent(
  state: MatchState,
  matchUnitId: string,
  attackDelta: number,
  defenseDelta: number,
): MatchState {
  const location = findUnit(state, matchUnitId);
  if (!location) return state;
  const maxDefense = Math.max(1, location.unit.maxDefense + defenseDelta);
  const currentDefense = Math.max(
    0,
    Math.min(maxDefense, location.unit.currentDefense + defenseDelta),
  );
  return replaceUnit(state, location, {
    ...location.unit,
    attack: Math.max(0, location.unit.attack + attackDelta),
    maxDefense,
    currentDefense,
  });
}

function addTemporaryStat(
  state: MatchState,
  matchUnitId: string,
  kind: "TEMP_ATTACK" | "TEMP_DEFENSE",
  amount: number,
  expiresAtTurn: number,
  sourceCardId: string,
): MatchState {
  return addUnitModifier(state, matchUnitId, {
    kind,
    amount,
    expiresAtTurn,
    sourceCardId,
  });
}

function addFlag(
  state: MatchState,
  matchUnitId: string,
  kind: string,
  expiresAtTurn: number,
  sourceCardId: string,
  data?: RuntimeModifier["data"],
): MatchState {
  return addUnitModifier(state, matchUnitId, {
    kind,
    expiresAtTurn,
    sourceCardId,
    data,
  });
}

function removeCardOnce(values: readonly string[], definitionId: string): readonly string[] | null {
  const index = values.indexOf(definitionId);
  if (index < 0) return null;
  return [...values.slice(0, index), ...values.slice(index + 1)];
}

function discardChosenFromHand(
  state: MatchState,
  playerId: string,
  definitionId: string,
): MatchState | null {
  const player = getPlayer(state, playerId);
  const hand = removeCardOnce(player.hand, definitionId);
  if (!hand) return null;
  return updatePlayer(state, playerId, (current) => ({
    ...current,
    hand,
    discard: [...current.discard, definitionId],
  }));
}

function putHandCardOnBottom(
  state: MatchState,
  playerId: string,
  definitionId: string,
): MatchState | null {
  const player = getPlayer(state, playerId);
  const hand = removeCardOnce(player.hand, definitionId);
  if (!hand) return null;
  let next = updatePlayer(state, playerId, (current) => ({
    ...current,
    hand,
    deck: [...current.deck, definitionId],
  }));
  next = incrementRuntimeCounter(next, playerId, "cardsPutBottom", 1);
  return next;
}

function returnDiscardToHand(
  state: MatchState,
  playerId: string,
  definitionId: string,
): MatchState | null {
  const player = getPlayer(state, playerId);
  const discard = removeCardOnce(player.discard, definitionId);
  if (!discard) return null;
  let next = updatePlayer(state, playerId, (current) => ({
    ...current,
    discard,
    hand: [...current.hand, definitionId],
  }));
  next = incrementRuntimeCounter(next, playerId, "cardsLeftDiscard", 1);
  return next;
}

function returnUnitToHand(state: MatchState, matchUnitId: string): MatchState {
  const location = findUnit(state, matchUnitId);
  if (!location) return state;
  let next = replaceUnit(state, location, null);
  next = updatePlayer(next, location.unit.ownerPlayerId, (player) => ({
    ...player,
    hand: [...player.hand, location.unit.definitionId],
  }));
  next = incrementRuntimeCounter(next, location.unit.ownerPlayerId, "unitsReturnedToHand", 1);
  return next;
}

function effectiveTempAmount(modifiers: readonly RuntimeModifier[], kind: string, turn: number): number {
  return modifiers
    .filter(
      (modifier) =>
        modifier.kind === kind &&
        (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= turn),
    )
    .reduce((sum, modifier) => sum + (modifier.amount ?? 0), 0);
}

export function getSet001EffectiveAttack(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
): number {
  let attack = unit.attack + effectiveTempAmount(getUnitModifiers(state, unit.matchUnitId), "TEMP_ATTACK", state.turn);
  const card = cardById(catalogue, unit.definitionId);
  const player = getPlayer(state, unit.ownerPlayerId);
  if (card.id === "SET001-0032" && player.hand.length >= 5) attack += 1;
  if (card.id === "SET001-0074" && player.board.filter(Boolean).length === 1) {
    // Urso de Bolso's bonus is DEF only.
  }
  if (card.id === "SET001-0158") {
    const hasBigAlly = player.board.some(
      (ally) => ally && ally.matchUnitId !== unit.matchUnitId && getSet001EffectiveDefense(state, ally, catalogue) >= 5,
    );
    if (hasBigAlly) attack += 1;
  }
  const council = player.board.some((ally) => ally?.definitionId === "SET001-0164");
  void council;
  return Math.max(0, attack);
}

export function getSet001EffectiveDefense(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
): number {
  let defense = unit.currentDefense + effectiveTempAmount(getUnitModifiers(state, unit.matchUnitId), "TEMP_DEFENSE", state.turn);
  const player = getPlayer(state, unit.ownerPlayerId);
  if (unit.definitionId === "SET001-0074" && player.board.filter(Boolean).length === 1) defense += 2;
  const councilCount = player.board.filter(
    (ally) => ally && ally.matchUnitId !== unit.matchUnitId && ally.definitionId === "SET001-0164",
  ).length;
  defense += councilCount;
  return Math.max(0, defense);
}

function isSilenced(state: MatchState, unit: UnitState): boolean {
  return getUnitModifiers(state, unit.matchUnitId).some(
    (modifier) => modifier.kind === "SILENCED" && (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
}

function hasUnitFlag(state: MatchState, unit: UnitState, kind: string): boolean {
  return getUnitModifiers(state, unit.matchUnitId).some(
    (modifier) => modifier.kind === kind && (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
}

export function getSet001EffectiveCost(
  state: MatchState,
  playerId: string,
  card: CardDefinition,
  catalogue: readonly CardDefinition[],
): number {
  let cost = card.cost;
  const player = getPlayer(state, playerId);
  if (card.id === "SET001-0019" && player.turnStats.unitsDestroyed > 0) cost -= 2;
  if (card.id === "SET001-0194") {
    const opponent = getOpponent(state, playerId);
    const hasLarge = opponent.board.some((unit) => {
      if (!unit) return false;
      const def = cardById(catalogue, unit.definitionId);
      return def.cost === 6 || def.cost === 7;
    });
    if (hasLarge) cost = 1;
  }
  const boardCards = player.board
    .filter((unit): unit is UnitState => Boolean(unit))
    .map((unit) => cardById(catalogue, unit.definitionId));
  if (card.type === "COMMAND") {
    if (
      boardCards.some((item) => item.id === "SET001-0033") &&
      getRuntimeCounter(state, playerId, "commandsCostReducedByR0") === 0
    ) {
      cost -= 1;
    }
    const targetedAlly = false;
    void targetedAlly;
  }
  if (getRuntimeCounter(state, playerId, "cardsPlayed") === 1 && boardCards.some((item) => item.id === "SET001-0048")) {
    cost -= 1;
  }
  for (const modifier of getPlayerModifiers(state, playerId)) {
    if (modifier.kind === "NEXT_COMMAND_COST" && card.type === "COMMAND") cost += modifier.amount ?? 0;
    if (modifier.kind === "NEXT_CONTROOLZ_COST" && card.type === "CONTROOLZ") cost += modifier.amount ?? 0;
    if (modifier.kind === "NEXT_ANY_COST") cost += modifier.amount ?? 0;
    if (modifier.kind === "CARD_COST" && modifier.data?.definitionId === card.id) cost += modifier.amount ?? 0;
  }
  return Math.max(1, cost);
}

export function canSet001UnitAttackController(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
): boolean {
  if (isSilenced(state, unit)) return true;
  const card = cardById(catalogue, unit.definitionId);
  const owner = getPlayer(state, unit.ownerPlayerId);
  if (card.id === "SET001-0004" && owner.turnStats.unitsAttacked <= 0) return false;
  if (card.id === "SET001-0017" && unit.enteredOnTurn === state.turn) return false;
  if (card.id === "SET001-0060" && unit.currentDefense === card.defense) return false;
  if (card.id === "SET001-0063") return false;
  if (card.id === "SET001-0147" || card.id === "SET001-0154") return false;
  if (card.id === "SET001-0150") {
    const opponent = getOpponent(state, unit.ownerPlayerId);
    if (opponent.board.some(Boolean)) return false;
  }
  if (card.id === "SET001-0177" && getRuntimeCounter(state, unit.ownerPlayerId, "signalDamageSinceOwnTurn") <= 0) return false;
  if (card.id === "SET001-0189" && getSet001EffectiveAttack(state, unit, catalogue) <= 2) return false;
  if (hasUnitFlag(state, unit, "CANNOT_ATTACK_CONTROLLER")) return false;
  return true;
}

export function canSet001UnitAttackAtAll(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
): boolean {
  if (isSilenced(state, unit)) return true;
  const card = cardById(catalogue, unit.definitionId);
  if (card.id === "SET001-0147" || card.id === "SET001-0154") return false;
  if (card.id === "SET001-0189" && getSet001EffectiveAttack(state, unit, catalogue) <= 2) return false;
  return true;
}

export function canSet001AttackOnDeploy(
  state: MatchState,
  unit: UnitState,
): boolean {
  if (unit.canAttackOnDeploy) return true;
  if (unit.definitionId === "SET001-0007") {
    return getRuntimeCounter(state, unit.ownerPlayerId, "signalDamageThisTurn") > 0;
  }
  if (unit.definitionId === "SET001-0017") return true;
  return hasUnitFlag(state, unit, "CAN_ATTACK_ON_DEPLOY");
}

export function getSet001MaxAttacksThisTurn(
  state: MatchState,
  unit: UnitState,
  defaultMax: number,
): number {
  const extra = getUnitModifiers(state, unit.matchUnitId)
    .filter((modifier) => modifier.kind === "EXTRA_ATTACK" && (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn))
    .reduce((sum, modifier) => sum + (modifier.amount ?? 0), 0);
  return Math.max(defaultMax, defaultMax + extra);
}

function consumeNextCostModifiers(state: MatchState, playerId: string, card: CardDefinition): MatchState {
  let next = state;
  if (card.type === "COMMAND" && getPlayer(state, playerId).board.some((unit) => unit?.definitionId === "SET001-0033")) {
    if (getRuntimeCounter(state, playerId, "commandsCostReducedByR0") === 0) {
      next = setRuntimeCounter(next, playerId, "commandsCostReducedByR0", 1);
    }
  }
  next = removePlayerModifiers(next, playerId, (modifier) => {
    if (modifier.kind === "NEXT_ANY_COST") return true;
    if (modifier.kind === "NEXT_COMMAND_COST" && card.type === "COMMAND") return true;
    if (modifier.kind === "NEXT_CONTROOLZ_COST" && card.type === "CONTROOLZ") return true;
    if (modifier.kind === "CARD_COST" && modifier.data?.definitionId === card.id) return true;
    return false;
  });
  return next;
}

export function afterSet001CardPaid(
  state: MatchState,
  playerId: string,
  card: CardDefinition,
): MatchState {
  let next = consumeNextCostModifiers(state, playerId, card);
  next = incrementRuntimeCounter(next, playerId, "cardsPlayed", 1);
  if (card.type === "COMMAND") next = incrementRuntimeCounter(next, playerId, "commandsPlayed", 1);
  return next;
}

function requireTarget(
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  selector: TargetSelector,
): Set001RuntimeResult {
  return {
    state: null as unknown as MatchState,
    pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: selector })],
  };
}

function requireDecision(
  state: MatchState,
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  decisionKey: string,
): Set001RuntimeResult {
  return {
    state,
    pendingEffects: [pending(runtimeId, context, text, trigger, "DECISION_REQUIRED", { decisionKey })],
  };
}

function moveTopToBottom(state: MatchState, playerId: string): MatchState {
  const player = getPlayer(state, playerId);
  if (!player.deck.length) return state;
  const [top, ...rest] = player.deck;
  let next = updatePlayer(state, playerId, (current) => ({ ...current, deck: [...rest, top] }));
  next = incrementRuntimeCounter(next, playerId, "cardsPutBottom", 1);
  return next;
}

function reorderTop(
  state: MatchState,
  playerId: string,
  count: number,
  orderedIds: readonly string[],
): MatchState | null {
  const player = getPlayer(state, playerId);
  const top = player.deck.slice(0, count);
  if (orderedIds.length !== top.length) return null;
  const expected = [...top].sort().join("|");
  const received = [...orderedIds].sort().join("|");
  if (expected !== received) return null;
  return updatePlayer(state, playerId, (current) => ({
    ...current,
    deck: [...orderedIds, ...current.deck.slice(top.length)],
  }));
}

export function resolveSet001RuntimeEffect(
  state: MatchState,
  runtimeId: string,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  catalogue: readonly CardDefinition[],
  context: Set001RuntimeContext,
  callbacks: Set001RuntimeCallbacks,
): Set001RuntimeResult {
  const cardId = runtimeId.split(":")[0];
  let next = state;
  const none: readonly Set001RuntimePending[] = [];

  // ---------------- RAGE ----------------
  if (runtimeId === "SET001-0003:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "OTHER_ALLY_CONTROOLZ" })] };
    next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_ATTACK", 1, next.turn, cardId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0009:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    const damaged = callbacks.damageUnit(next, target.unit.matchUnitId, 1, context.targets, context.choices);
    next = damaged.state;
    if (findUnit(next, target.unit.matchUnitId)) {
      next = addFlag(next, target.unit.matchUnitId, "CANNOT_RECEIVE_DEF", next.turn, cardId);
    }
    return { state: next, pendingEffects: damaged.pendingEffects };
  }
  if (runtimeId === "SET001-0011:0") {
    if (getPlayer(next, context.sourcePlayerId).turnStats.unitsAttacked > 0) {
      next = changeSignal(next, getOpponent(next, context.sourcePlayerId).playerId, -1);
    }
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0013:0") {
    if (!context.sourceUnitId) return { state, pendingEffects: none };
    const mode = context.choices?.modes?.selfDamageBoost;
    if (!mode) return requireDecision(state, runtimeId, context, text, trigger, "selfDamageBoost");
    if (mode !== "YES") return { state, pendingEffects: none };
    if (getRuntimeCounter(next, context.sourcePlayerId, `rage0013:${context.sourceUnitId}`) > 0) return { state, pendingEffects: none };
    const hurt = callbacks.damageUnit(next, context.sourceUnitId, 1, context.targets, context.choices);
    next = hurt.state;
    if (findUnit(next, context.sourceUnitId)) {
      next = addTemporaryStat(next, context.sourceUnitId, "TEMP_ATTACK", 2, next.turn, cardId);
      next = setRuntimeCounter(next, context.sourcePlayerId, `rage0013:${context.sourceUnitId}`, 1);
    }
    return { state: next, pendingEffects: hurt.pendingEffects };
  }
  if (runtimeId === "SET001-0016:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "OTHER_ALLY_CONTROOLZ" })] };
    const hurt = callbacks.damageUnit(next, target.unit.matchUnitId, 1, context.targets, context.choices);
    next = hurt.state;
    if (findUnit(next, target.unit.matchUnitId)) {
      next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_ATTACK", 3, next.turn, cardId);
    }
    return { state: next, pendingEffects: hurt.pendingEffects };
  }
  if (runtimeId === "SET001-0021:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ANY_CONTROOLZ" })] };
    return callbacks.damageUnit(next, target.unit.matchUnitId, 2, context.targets, context.choices);
  }
  if (runtimeId === "SET001-0022:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ANY_CONTROOLZ" })] };
    const ally = target.playerIndex === getPlayerIndex(next, context.sourcePlayerId);
    const hurt = callbacks.damageUnit(next, target.unit.matchUnitId, 1, context.targets, context.choices);
    next = hurt.state;
    if (ally && findUnit(next, target.unit.matchUnitId)) {
      next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_ATTACK", 1, next.turn, cardId);
    }
    return { state: next, pendingEffects: hurt.pendingEffects };
  }
  if (runtimeId === "SET001-0023:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ALLY_CONTROOLZ" })] };
    next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_ATTACK", 2, next.turn, cardId);
    const definition = cardById(catalogue, target.unit.definitionId);
    if (definition.cost <= 2) next = addFlag(next, target.unit.matchUnitId, "CAN_ATTACK_ON_DEPLOY", next.turn, cardId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0024:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ALLY_CONTROOLZ" })] };
    next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_ATTACK", 3, next.turn, cardId);
    next = addTemporaryStat(next, target.unit.matchUnitId, "TEMP_DEFENSE", -1, next.turn, cardId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0025:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    const hurt = callbacks.damageUnit(next, target.unit.matchUnitId, 3, context.targets, context.choices);
    next = hurt.state;
    if (findUnit(next, target.unit.matchUnitId)) next = addFlag(next, target.unit.matchUnitId, "SILENCED", next.turn, cardId);
    return { state: next, pendingEffects: hurt.pendingEffects };
  }
  if (runtimeId === "SET001-0026:0") {
    const bonus = getPlayer(next, context.sourcePlayerId).turnStats.unitsDestroyed > 0 ? 4 : 2;
    const mode = context.choices?.modes?.targetKind;
    if (!mode) return requireDecision(state, runtimeId, context, text, trigger, "targetKind");
    if (mode === "CONTROLLER") {
      next = changeSignal(next, getOpponent(next, context.sourcePlayerId).playerId, -bonus);
      return { state: next, pendingEffects: none };
    }
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    return callbacks.damageUnit(next, target.unit.matchUnitId, bonus, context.targets, context.choices);
  }
  if (runtimeId === "SET001-0027:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ALLY_CONTROOLZ" })] };
    next = addUnitModifier(next, target.unit.matchUnitId, { kind: "EXTRA_ATTACK", amount: 1, expiresAtTurn: next.turn, sourceCardId: cardId });
    next = addFlag(next, target.unit.matchUnitId, "DAMAGE_AFTER_FIRST_ATTACK", next.turn, cardId, { amount: 2 });
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0028:0") {
    for (const location of allUnits(next).filter((entry) => entry.playerIndex === getPlayerIndex(next, context.sourcePlayerId))) {
      next = addTemporaryStat(next, location.unit.matchUnitId, "TEMP_ATTACK", 3, next.turn, cardId);
      next = addFlag(next, location.unit.matchUnitId, "END_TURN_DAMAGE_IF_ATTACKED", next.turn, cardId, { amount: 2 });
    }
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0029:0") {
    const ally = selectedUnit(next, context, "ALLY_CONTROOLZ");
    const enemy = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!ally) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ALLY_CONTROOLZ" })] };
    if (!enemy) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    const allyAttack = getSet001EffectiveAttack(next, ally.unit, catalogue);
    const enemyAttack = getSet001EffectiveAttack(next, enemy.unit, catalogue);
    const enemyHurt = callbacks.damageUnit(next, enemy.unit.matchUnitId, allyAttack, context.targets, context.choices);
    next = enemyHurt.state;
    const allyHurt = callbacks.damageUnit(next, ally.unit.matchUnitId, enemyAttack, context.targets, context.choices);
    next = allyHurt.state;
    if (!findUnit(next, enemy.unit.matchUnitId)) next = changeSignal(next, getOpponent(next, context.sourcePlayerId).playerId, -3);
    return { state: next, pendingEffects: [...enemyHurt.pendingEffects, ...allyHurt.pendingEffects] };
  }

  // ---------------- LOGIC ----------------
  if (runtimeId === "SET001-0031:0" || runtimeId === "SET001-0051:0") {
    const count = runtimeId === "SET001-0031:0" ? 2 : 3;
    const order = context.choices?.cards?.topOrder;
    if (!order) return requireDecision(state, runtimeId, context, text, trigger, "topOrder");
    const reordered = reorderTop(next, context.sourcePlayerId, count, order);
    return reordered ? { state: reordered, pendingEffects: none } : requireDecision(state, runtimeId, context, text, trigger, "topOrder");
  }
  if (runtimeId === "SET001-0036:0") {
    const mode = context.choices?.modes?.topAction;
    if (!mode) return requireDecision(state, runtimeId, context, text, trigger, "topAction");
    if (mode === "BOTTOM") next = moveTopToBottom(next, context.sourcePlayerId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0038:0") {
    const guess = context.choices?.modes?.guessType;
    if (!guess) return requireDecision(state, runtimeId, context, text, trigger, "guessType");
    const player = getPlayer(next, context.sourcePlayerId);
    const top = player.deck[0];
    if (!top) return { state: next, pendingEffects: none };
    const topCard = cardById(catalogue, top);
    if (topCard.type === guess) next = drawCards(next, context.sourcePlayerId, 1);
    else next = moveTopToBottom(next, context.sourcePlayerId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0041:0") {
    next = drawCards(next, context.sourcePlayerId, 1);
    const chosen = context.choices?.cards?.handToBottom?.[0];
    if (!chosen) return requireDecision(next, runtimeId, context, text, trigger, "handToBottom");
    const moved = putHandCardOnBottom(next, context.sourcePlayerId, chosen);
    return moved ? { state: moved, pendingEffects: none } : requireDecision(next, runtimeId, context, text, trigger, "handToBottom");
  }
  if (runtimeId === "SET001-0045:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "OTHER_ALLY_CONTROOLZ" })] };
    const returnedDefinition = cardById(catalogue, target.unit.definitionId);
    next = returnUnitToHand(next, target.unit.matchUnitId);
    next = addPlayerModifier(next, context.sourcePlayerId, {
      kind: returnedDefinition.type === "CONTROOLZ" ? "NEXT_CONTROOLZ_COST" : "NEXT_COMMAND_COST",
      amount: -1,
      expiresAtTurn: next.turn,
      sourceCardId: cardId,
    });
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0049:0") {
    const choices = context.choices?.cards?.takeFromTop ?? [];
    const top = getPlayer(next, context.sourcePlayerId).deck.slice(0, 5);
    if (!context.choices?.cards?.takeFromTop) return requireDecision(state, runtimeId, context, text, trigger, "takeFromTop");
    const chosen = choices.filter((id) => top.includes(id));
    if (chosen.length > 2) return requireDecision(state, runtimeId, context, text, trigger, "takeFromTop");
    const chosenCards = chosen.map((id) => cardById(catalogue, id));
    if (chosenCards.filter((card) => card.type === "CONTROOLZ").length > 1 || chosenCards.filter((card) => card.type === "COMMAND").length > 1) {
      return requireDecision(state, runtimeId, context, text, trigger, "takeFromTop");
    }
    const remaining = [...top];
    for (const id of chosen) remaining.splice(remaining.indexOf(id), 1);
    next = updatePlayer(next, context.sourcePlayerId, (player) => ({
      ...player,
      hand: [...player.hand, ...chosen],
      deck: [...player.deck.slice(top.length), ...remaining],
    }));
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0050:0") {
    const need = Math.max(0, 5 - getPlayer(next, context.sourcePlayerId).hand.length);
    next = drawCards(next, context.sourcePlayerId, Math.min(3, need));
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0052:0") {
    next = drawCards(next, context.sourcePlayerId, 1);
    if (getRuntimeCounter(next, context.sourcePlayerId, "cardsPutBottom") > 0) {
      next = drawCards(next, context.sourcePlayerId, 1);
      const chosen = context.choices?.cards?.handToBottom?.[0];
      if (!chosen) return requireDecision(next, runtimeId, context, text, trigger, "handToBottom");
      const moved = putHandCardOnBottom(next, context.sourcePlayerId, chosen);
      if (moved) next = moved;
    }
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0053:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    next = addFlag(next, target.unit.matchUnitId, "SILENCED", next.turn, cardId);
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0054:0") {
    const chosen = context.choices?.cards?.takeFromTop?.[0];
    const top = getPlayer(next, context.sourcePlayerId).deck.slice(0, 4);
    if (!chosen || !top.includes(chosen)) return requireDecision(state, runtimeId, context, text, trigger, "takeFromTop");
    const remaining = [...top];
    remaining.splice(remaining.indexOf(chosen), 1);
    next = updatePlayer(next, context.sourcePlayerId, (player) => ({
      ...player,
      hand: [...player.hand, chosen],
      deck: [...player.deck.slice(top.length), ...remaining],
    }));
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0055:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ALLY_CONTROOLZ" })] };
    next = returnUnitToHand(next, target.unit.matchUnitId);
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "NEXT_CONTROOLZ_COST", amount: -2, expiresAtTurn: next.turn, sourceCardId: cardId });
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0056:0") {
    const chosen = context.choices?.cards?.opponentHand?.[0];
    if (!chosen) return requireDecision(state, runtimeId, context, text, trigger, "opponentHand");
    const opponentId = getOpponent(next, context.sourcePlayerId).playerId;
    const opponent = getPlayer(next, opponentId);
    if (!opponent.hand.includes(chosen) || cardById(catalogue, chosen).cost > 2) return requireDecision(state, runtimeId, context, text, trigger, "opponentHand");
    const hand = removeCardOnce(opponent.hand, chosen)!;
    next = updatePlayer(next, opponentId, (player) => ({ ...player, hand, deck: [...player.deck, chosen] }));
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0057:0") {
    next = drawCards(next, context.sourcePlayerId, 2);
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "NEXT_COMMAND_COST", amount: -2, expiresAtTurn: next.turn, sourceCardId: cardId, data: { uses: 2 } });
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "NO_MORE_DRAW", expiresAtTurn: next.turn, sourceCardId: cardId });
    return { state: next, pendingEffects: none };
  }
  if (runtimeId === "SET001-0058:0") {
    const targets = selectedUnits(next, context, "ENEMY_CONTROOLZ").slice(0, 2);
    if (!context.targets?.ENEMY_CONTROOLZ) return { state, pendingEffects: [pending(runtimeId, context, text, trigger, "TARGET_REQUIRED", { requiredTarget: "ENEMY_CONTROOLZ" })] };
    for (const target of targets) next = returnUnitToHand(next, target.unit.matchUnitId);
    next = drawCards(next, getOpponent(next, context.sourcePlayerId).playerId, 1);
    return { state: next, pendingEffects: none };
  }

  return {
    state,
    pendingEffects: [
      pending(runtimeId, context, text, trigger, "UNSUPPORTED_ACTION", {
        decisionKey: `runtime:${runtimeId}`,
      }),
    ],
  };
}

/** Utility used by the main engine when a unit leaves play. */
export function clearSet001UnitRuntime(state: MatchState, matchUnitId: string): MatchState {
  return removeUnitModifiers(state, matchUnitId, () => true);
}

/** Exposed helpers for later class-specific handlers/tests. */
export const SET001_RUNTIME_INTERNALS = {
  findUnit,
  modifyPermanent,
  addTemporaryStat,
  addFlag,
  discardChosenFromHand,
  putHandCardOnBottom,
  returnDiscardToHand,
  returnUnitToHand,
  moveTopToBottom,
  exileCard,
  getRuntimeCounter,
  incrementRuntimeCounter,
  markModifierUsedThisTurn,
};
