import type {
  CardDefinition,
  LaneIndex,
  MatchState,
  TargetSelector,
  UnitState,
} from "../domain";
import { getSet001TokenDefinition } from "../cards/set001/tokens";
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
  getRuntimeCounter,
  incrementRuntimeCounter,
  removePlayerModifiers,
  removeUnitModifiers,
  setRuntimeCounter,
} from "./runtime-state";
import {
  SET001_RUNTIME_INTERNALS,
  type RuntimeChoiceBindings,
  type RuntimeTargetBindings,
  type Set001RuntimeCallbacks,
  type Set001RuntimeContext,
  type Set001RuntimePending,
  type Set001RuntimeResult,
} from "./set001-runtime";

interface UnitLocation {
  playerIndex: 0 | 1;
  lane: LaneIndex;
  unit: UnitState;
}

function findUnit(state: MatchState, id: string): UnitLocation | null {
  for (const playerIndex of [0, 1] as const) {
    for (const lane of [0, 1, 2] as const) {
      const unit = state.players[playerIndex].board[lane];
      if (unit?.matchUnitId === id) return { playerIndex, lane, unit };
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

function cardById(catalogue: readonly CardDefinition[], id: string): CardDefinition {
  const card = catalogue.find((item) => item.id === id) ?? getSet001TokenDefinition(id);
  if (!card) throw new Error(`Carta desconhecida no runtime SET001: ${id}`);
  return card;
}

function selectedUnit(
  state: MatchState,
  context: Set001RuntimeContext,
  selector: TargetSelector,
): UnitLocation | null {
  const id = context.targets?.[selector]?.[0];
  if (!id) return null;
  const unit = findUnit(state, id);
  if (!unit) return null;
  const sourceIndex = getPlayerIndex(state, context.sourcePlayerId);
  if (selector === "ALLY_CONTROOLZ" && unit.playerIndex !== sourceIndex) return null;
  if (selector === "OTHER_ALLY_CONTROOLZ" && (unit.playerIndex !== sourceIndex || unit.unit.matchUnitId === context.sourceUnitId)) return null;
  if (selector === "ENEMY_CONTROOLZ" && unit.playerIndex === sourceIndex) return null;
  return unit;
}

function selectedUnits(
  state: MatchState,
  context: Set001RuntimeContext,
  selector: TargetSelector,
): UnitLocation[] {
  const ids = context.targets?.[selector] ?? [];
  return ids.map((id) => findUnit(state, id)).filter((unit): unit is UnitLocation => Boolean(unit));
}

function makePending(
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  reason: Set001RuntimePending["reason"],
  requiredTarget?: TargetSelector,
  decisionKey?: string,
): Set001RuntimeResult {
  return {
    state: null as unknown as MatchState,
    pendingEffects: [
      {
        cardId: runtimeId.split(":")[0],
        sourcePlayerId: context.sourcePlayerId,
        sourceUnitId: context.sourceUnitId,
        trigger,
        text,
        reason,
        requiredTarget,
        decisionKey,
      },
    ],
  };
}

function withStatePending(state: MatchState, result: Set001RuntimeResult): Set001RuntimeResult {
  return result.state ? result : { ...result, state };
}

function targetPending(
  state: MatchState,
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  target: TargetSelector,
): Set001RuntimeResult {
  return withStatePending(state, makePending(runtimeId, context, text, trigger, "TARGET_REQUIRED", target));
}

function decisionPending(
  state: MatchState,
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  key: string,
): Set001RuntimeResult {
  return withStatePending(state, makePending(runtimeId, context, text, trigger, "DECISION_REQUIRED", undefined, key));
}

function removeCardOnce(values: readonly string[], id: string): readonly string[] | null {
  const index = values.indexOf(id);
  if (index < 0) return null;
  return [...values.slice(0, index), ...values.slice(index + 1)];
}

function discardFromHand(state: MatchState, playerId: string, id: string): MatchState | null {
  const hand = removeCardOnce(getPlayer(state, playerId).hand, id);
  if (!hand) return null;
  return updatePlayer(state, playerId, (player) => ({
    ...player,
    hand,
    discard: [...player.discard, id],
  }));
}

function discardChosen(
  state: MatchState,
  runtimeId: string,
  context: Set001RuntimeContext,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  key = "discard",
): Set001RuntimeResult {
  const id = context.choices?.cards?.[key]?.[0];
  if (!id) return decisionPending(state, runtimeId, context, text, trigger, key);
  const next = discardFromHand(state, context.sourcePlayerId, id);
  if (!next) return decisionPending(state, runtimeId, context, text, trigger, key);
  return { state: next, pendingEffects: [] };
}

function removeFromDiscard(state: MatchState, playerId: string, id: string): MatchState | null {
  const discard = removeCardOnce(getPlayer(state, playerId).discard, id);
  if (!discard) return null;
  let next = updatePlayer(state, playerId, (player) => ({ ...player, discard }));
  next = incrementRuntimeCounter(next, playerId, "cardsLeftDiscard", 1);
  return next;
}

function returnDiscardCardToHand(state: MatchState, playerId: string, id: string): MatchState | null {
  const removed = removeFromDiscard(state, playerId, id);
  if (!removed) return null;
  return updatePlayer(removed, playerId, (player) => ({ ...player, hand: [...player.hand, id] }));
}

function moveHandToBottom(state: MatchState, playerId: string, id: string): MatchState | null {
  const hand = removeCardOnce(getPlayer(state, playerId).hand, id);
  if (!hand) return null;
  let next = updatePlayer(state, playerId, (player) => ({ ...player, hand, deck: [...player.deck, id] }));
  next = incrementRuntimeCounter(next, playerId, "cardsPutBottom", 1);
  return next;
}

function emptyLanes(state: MatchState, playerId: string): LaneIndex[] {
  const player = getPlayer(state, playerId);
  return ([0, 1, 2] as const).filter((lane) => !player.board[lane]);
}

function chosenTokenLanes(
  state: MatchState,
  playerId: string,
  count: number,
  choices?: RuntimeChoiceBindings,
): LaneIndex[] | null {
  const free = emptyLanes(state, playerId);
  const actualCount = Math.min(count, free.length);
  if (actualCount === 0) return [];
  if (free.length === actualCount) return free.slice(0, actualCount);
  const lanes: LaneIndex[] = [];
  for (let i = 1; i <= actualCount; i += 1) {
    const lane = choices?.numbers?.[`tokenLane${i}`];
    if (lane !== 0 && lane !== 1 && lane !== 2) return null;
    if (!free.includes(lane) || lanes.includes(lane)) return null;
    lanes.push(lane);
  }
  return lanes;
}

function connectRuntimeUnit(
  state: MatchState,
  playerId: string,
  definition: CardDefinition,
  lane: LaneIndex,
): { state: MatchState; matchUnitId: string } {
  if (definition.type !== "CONTROOLZ") throw new Error("Somente Controolz podem entrar em campo.");
  const playerIndex = getPlayerIndex(state, playerId);
  const player = state.players[playerIndex];
  if (player.board[lane]) throw new Error("Linha ocupada ao criar Controolz por efeito.");
  const sequence = (state.runtime?.sequence ?? 0) + 1;
  const matchUnitId = `${state.matchId}:runtime:${state.turn}:${playerId}:${definition.id}:${sequence}`;
  const board = [...player.board] as [UnitState | null, UnitState | null, UnitState | null];
  board[lane] = {
    matchUnitId,
    definitionId: definition.id,
    ownerPlayerId: playerId,
    lane,
    attack: definition.attack,
    maxDefense: definition.defense,
    currentDefense: definition.defense,
    enteredOnTurn: state.turn,
    attacksUsedThisTurn: 0,
    canAttackOnDeploy: false,
  };
  return { state: replacePlayer(state, playerIndex, { ...player, board }), matchUnitId };
}

function createTokens(
  state: MatchState,
  playerId: string,
  tokenId: string,
  count: number,
  choices?: RuntimeChoiceBindings,
): { state: MatchState; created: string[] } | null {
  const token = getSet001TokenDefinition(tokenId);
  if (!token) throw new Error(`Token desconhecido: ${tokenId}`);
  const lanes = chosenTokenLanes(state, playerId, count, choices);
  if (!lanes) return null;
  let next = state;
  const created: string[] = [];
  for (const lane of lanes) {
    const connected = connectRuntimeUnit(next, playerId, token, lane);
    next = connected.state;
    created.push(connected.matchUnitId);
  }
  return { state: next, created };
}

function restoreDefense(state: MatchState, unitId: string, amount: number): MatchState {
  const location = findUnit(state, unitId);
  if (!location) return state;
  if ((state.runtime?.unitModifiers[unitId] ?? []).some((modifier) => modifier.kind === "CANNOT_RECEIVE_DEF" && (modifier.expiresAtTurn ?? state.turn) >= state.turn)) return state;
  const nextValue = Math.min(location.unit.maxDefense, location.unit.currentDefense + Math.max(0, amount));
  if (nextValue === location.unit.currentDefense) return state;
  let next = replaceUnit(state, location, { ...location.unit, currentDefense: nextValue });
  next = incrementRuntimeCounter(next, location.unit.ownerPlayerId, "defenseRecovered", 1);
  next = incrementRuntimeCounter(next, location.unit.ownerPlayerId, `defenseRecovered:${unitId}`, 1);
  return next;
}

function applyPermanent(state: MatchState, unitId: string, attack: number, defense: number): MatchState {
  return SET001_RUNTIME_INTERNALS.modifyPermanent(state, unitId, attack, defense);
}

function addTempAttack(state: MatchState, unitId: string, amount: number, expiresAtTurn: number, sourceCardId: string): MatchState {
  return SET001_RUNTIME_INTERNALS.addTemporaryStat(state, unitId, "TEMP_ATTACK", amount, expiresAtTurn, sourceCardId);
}

function addTempDefense(state: MatchState, unitId: string, amount: number, expiresAtTurn: number, sourceCardId: string): MatchState {
  return SET001_RUNTIME_INTERNALS.addTemporaryStat(state, unitId, "TEMP_DEFENSE", amount, expiresAtTurn, sourceCardId);
}

function addFlag(state: MatchState, unitId: string, kind: string, expiresAtTurn: number, sourceCardId: string, data?: Record<string, string | number | boolean>): MatchState {
  return SET001_RUNTIME_INTERNALS.addFlag(state, unitId, kind, expiresAtTurn, sourceCardId, data);
}

function silence(state: MatchState, unitId: string, expiresAtTurn: number, sourceCardId: string): MatchState {
  return addFlag(state, unitId, "SILENCED", expiresAtTurn, sourceCardId);
}

function swapStats(state: MatchState, unitId: string, expiresAtTurn: number, sourceCardId: string): MatchState {
  return addFlag(state, unitId, "SWAP_STATS", expiresAtTurn, sourceCardId);
}

function returnUnitToHand(state: MatchState, unitId: string): MatchState {
  return SET001_RUNTIME_INTERNALS.returnUnitToHand(state, unitId);
}

function exileDiscardCard(state: MatchState, ownerPlayerId: string, id: string): MatchState | null {
  const removed = removeFromDiscard(state, ownerPlayerId, id);
  if (!removed) return null;
  return exileCard(removed, ownerPlayerId, id);
}

function chooseFromTop(
  state: MatchState,
  playerId: string,
  count: number,
  chosen: readonly string[],
): { chosen: string[]; remaining: string[] } | null {
  const top = getPlayer(state, playerId).deck.slice(0, count);
  const pool = [...top];
  for (const id of chosen) {
    const index = pool.indexOf(id);
    if (index < 0) return null;
    pool.splice(index, 1);
  }
  return { chosen: [...chosen], remaining: pool };
}

function commitTopSelectionToHand(
  state: MatchState,
  playerId: string,
  count: number,
  chosen: readonly string[],
  bottomOrder?: readonly string[],
): MatchState | null {
  const selection = chooseFromTop(state, playerId, count, chosen);
  if (!selection) return null;
  const remaining = bottomOrder ? [...bottomOrder] : selection.remaining;
  if ([...remaining].sort().join("|") !== [...selection.remaining].sort().join("|")) return null;
  return updatePlayer(state, playerId, (player) => ({
    ...player,
    hand: [...player.hand, ...selection.chosen],
    deck: [...player.deck.slice(Math.min(count, player.deck.length)), ...remaining],
  }));
}

function isUnsupported(result: Set001RuntimeResult, runtimeId: string): boolean {
  return (
    result.pendingEffects.length === 1 &&
    result.pendingEffects[0]?.reason === "UNSUPPORTED_ACTION" &&
    result.pendingEffects[0]?.decisionKey === `runtime:${runtimeId}`
  );
}

export function resolveSet001ExtraRuntimeEffect(
  state: MatchState,
  runtimeId: string,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  catalogue: readonly CardDefinition[],
  context: Set001RuntimeContext,
  callbacks: Set001RuntimeCallbacks,
): Set001RuntimeResult | null {
  const cardId = runtimeId.split(":")[0];
  let next = state;
  const noPending: readonly Set001RuntimePending[] = [];

  // ---------------- LOGIC completion ----------------
  if (runtimeId === "SET001-0047:0") {
    next = drawCards(next, context.sourcePlayerId, 2);
    return discardChosen(next, runtimeId, context, text, trigger, "discard");
  }

  // ---------------- WILD ----------------
  if (runtimeId === "SET001-0061:0" || runtimeId === "SET001-0071:0") {
    const tokenId = runtimeId === "SET001-0061:0" ? "SET001-TOKEN-BROTINHO" : "SET001-TOKEN-ESPORO";
    const created = createTokens(next, context.sourcePlayerId, tokenId, 1, context.choices);
    if (!created) return decisionPending(state, runtimeId, context, text, trigger, "tokenLane1");
    return { state: created.state, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0066:0") {
    if (!context.sourceUnitId) return { state, pendingEffects: noPending };
    const hasCost1 = getPlayer(next, context.sourcePlayerId).board.some((unit) => unit && unit.matchUnitId !== context.sourceUnitId && cardById(catalogue, unit.definitionId).cost === 1);
    if (hasCost1) next = applyPermanent(next, context.sourceUnitId, 1, 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0077:0" || runtimeId === "SET001-0080:0") {
    const count = runtimeId === "SET001-0077:0" ? 2 : 1;
    const created = createTokens(next, context.sourcePlayerId, "SET001-TOKEN-BROTINHO", count, context.choices);
    if (!created) return decisionPending(state, runtimeId, context, text, trigger, "tokenLane1");
    return { state: created.state, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0079:0") {
    const targets = selectedUnits(next, context, "OTHER_ALLY_CONTROOLZ").slice(0, 4);
    if (!context.targets?.OTHER_ALLY_CONTROOLZ?.length && getPlayer(next, context.sourcePlayerId).board.filter(Boolean).length > 1) {
      return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    }
    let remaining = 4;
    for (let i = 0; i < targets.length; i += 1) {
      const amount = Math.max(0, Math.trunc(context.choices?.numbers?.[`def${i + 1}`] ?? (i === 0 ? remaining : 0)));
      if (amount > remaining) return decisionPending(state, runtimeId, context, text, trigger, `def${i + 1}`);
      next = applyPermanent(next, targets[i].unit.matchUnitId, 0, amount);
      remaining -= amount;
    }
    if (remaining !== 0 && targets.length > 0) return decisionPending(state, runtimeId, context, text, trigger, "defDistribution");
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0082:0") {
    const targets = selectedUnits(next, context, "ALLY_CONTROOLZ").slice(0, 2);
    if (!context.targets?.ALLY_CONTROOLZ) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    for (const target of targets) next = restoreDefense(next, target.unit.matchUnitId, 2);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0083:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    const mode = context.choices?.modes?.adaptation;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "adaptation");
    if (mode === "ATTACK") next = addTempAttack(next, target.unit.matchUnitId, 3, next.turn, cardId);
    else if (mode === "DEFENSE") next = applyPermanent(next, target.unit.matchUnitId, 0, 3);
    else return decisionPending(state, runtimeId, context, text, trigger, "adaptation");
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0084:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    next = returnUnitToHand(next, target.unit.matchUnitId);
    const created = createTokens(next, context.sourcePlayerId, "SET001-TOKEN-BROTINHO", 2, context.choices);
    if (!created) return decisionPending(next, runtimeId, context, text, trigger, "tokenLane1");
    return { state: created.state, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0085:0") {
    const allies = allUnits(next).filter((entry) => entry.playerIndex === getPlayerIndex(next, context.sourcePlayerId));
    const bonusDefense = allies.length >= 3 ? 2 : 1;
    for (const ally of allies) next = applyPermanent(next, ally.unit.matchUnitId, 1, bonusDefense);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0087:0") {
    const ally = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!ally) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    const selected = context.choices?.cards?.evolution?.[0];
    if (!selected) return decisionPending(state, runtimeId, context, text, trigger, "evolution");
    const top = getPlayer(next, context.sourcePlayerId).deck.slice(0, 5);
    if (!top.includes(selected)) return decisionPending(state, runtimeId, context, text, trigger, "evolution");
    const replacement = cardById(catalogue, selected);
    const allyDef = cardById(catalogue, ally.unit.definitionId);
    if (replacement.type !== "CONTROOLZ" || replacement.cost > allyDef.cost + 4) return decisionPending(state, runtimeId, context, text, trigger, "evolution");
    const lane = ally.lane;
    const remainingTop = [...top];
    remainingTop.splice(remainingTop.indexOf(selected), 1);
    next = replaceUnit(next, ally, null);
    next = updatePlayer(next, context.sourcePlayerId, (player) => ({
      ...player,
      deck: [...player.deck.slice(top.length), ally.unit.definitionId, ...remainingTop],
    }));
    const connected = connectRuntimeUnit(next, context.sourcePlayerId, replacement, lane);
    next = connected.state;
    return { state: next, pendingEffects: noPending };
  }

  // ---------------- GLITCH ----------------
  if (runtimeId === "SET001-0090:0") {
    if (!context.sourceUnitId) return { state, pendingEffects: noPending };
    const mode = context.choices?.modes?.swapSelf;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "swapSelf");
    if (mode === "YES") next = swapStats(next, context.sourceUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0091:0") {
    const choice = context.choices?.modes?.opponentChoice;
    if (!choice) return decisionPending(state, runtimeId, context, text, trigger, "opponentChoice");
    if (choice === "DISCARD") {
      const discarded = discardChosen(next, runtimeId, context, text, trigger, "discard");
      return discarded;
    }
    if (choice === "DAMAGE" && context.sourceUnitId) return callbacks.damageUnit(next, context.sourceUnitId, 1, context.targets, context.choices);
    return decisionPending(state, runtimeId, context, text, trigger, "opponentChoice");
  }
  if (runtimeId === "SET001-0094:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    next = swapStats(next, target.unit.matchUnitId, next.turn, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0099:0") {
    const choice = context.choices?.modes?.opponentChoice;
    if (!choice) return decisionPending(state, runtimeId, context, text, trigger, "opponentChoice");
    if (choice === "DRAW") return { state: drawCards(next, context.sourcePlayerId, 1), pendingEffects: noPending };
    if (choice === "DAMAGE") {
      const target = selectedUnit(next, context, "ANY_CONTROOLZ");
      if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
      return callbacks.damageUnit(next, target.unit.matchUnitId, 2, context.targets, context.choices);
    }
    return decisionPending(state, runtimeId, context, text, trigger, "opponentChoice");
  }
  if (runtimeId === "SET001-0100:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    const def = cardById(catalogue, target.unit.definitionId);
    if (def.cost > 2 || target.unit.matchUnitId === context.sourceUnitId) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    next = returnUnitToHand(next, target.unit.matchUnitId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0104:0") {
    const id = context.choices?.cards?.discardCommand?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "discardCommand");
    const def = cardById(catalogue, id);
    if (def.type !== "COMMAND" || def.cost > 2) return decisionPending(state, runtimeId, context, text, trigger, "discardCommand");
    const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
    if (!returned) return decisionPending(state, runtimeId, context, text, trigger, "discardCommand");
    next = returned;
    const discardResult = discardChosen(next, runtimeId, context, text, trigger, "discard");
    return discardResult;
  }
  if (runtimeId === "SET001-0105:0") {
    const targets = selectedUnits(next, context, "ANY_CONTROOLZ").slice(0, 2);
    if (!context.targets?.ANY_CONTROOLZ) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    for (const target of targets) next = swapStats(next, target.unit.matchUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0107:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    const def = cardById(catalogue, target.unit.definitionId);
    if (def.cost > 4 || def.id === "SET001-0107") return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    const connection = def.effects?.find((effect) => effect.trigger === "CONNECTION");
    if (!connection) return { state: next, pendingEffects: noPending };
    return callbacks.resolveConnection(next, def.id, context.sourcePlayerId, context.sourceUnitId ?? "", context.targets, context.choices);
  }
  if (runtimeId === "SET001-0108:0") {
    for (const unit of allUnits(next)) {
      if (unit.unit.matchUnitId !== context.sourceUnitId) next = swapStats(next, unit.unit.matchUnitId, next.turn + 2, cardId);
    }
    next = incrementRuntimeCounter(next, context.sourcePlayerId, "statsSwapped", 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0109:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    next = swapStats(next, target.unit.matchUnitId, next.turn, cardId);
    next = incrementRuntimeCounter(next, context.sourcePlayerId, "statsSwapped", 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0110:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    const top = getPlayer(next, context.sourcePlayerId).deck[0];
    if (!top) return { state: next, pendingEffects: noPending };
    const def = cardById(catalogue, top);
    if (def.type === "CONTROOLZ") next = addTempDefense(next, target.unit.matchUnitId, 2, next.turn, cardId);
    else next = addTempAttack(next, target.unit.matchUnitId, 2, next.turn, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0111:0") {
    const ally = selectedUnit(next, context, "ALLY_CONTROOLZ");
    const enemy = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!ally) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    if (!enemy) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    next = returnUnitToHand(next, ally.unit.matchUnitId);
    next = addTempAttack(next, enemy.unit.matchUnitId, -1, next.turn, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0112:0") {
    const candidates = selectedUnits(next, context, "ENEMY_CONTROOLZ").slice(0, 2);
    if (!context.targets?.ENEMY_CONTROOLZ?.length) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    const chosenByOpponent = context.choices?.modes?.opponentUnit;
    if (!chosenByOpponent || !candidates.some((candidate) => candidate.unit.matchUnitId === chosenByOpponent)) {
      return decisionPending(state, runtimeId, context, text, trigger, "opponentUnit");
    }
    next = returnUnitToHand(next, chosenByOpponent);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0113:0") {
    const id = context.choices?.cards?.copyCommand?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "copyCommand");
    const def = cardById(catalogue, id);
    if (def.type !== "COMMAND" || def.cost > 2 || !getPlayer(next, context.sourcePlayerId).discard.includes(id)) {
      return decisionPending(state, runtimeId, context, text, trigger, "copyCommand");
    }
    const effect = def.effects?.find((item) => item.trigger === "COMMAND_RESOLVE");
    if (!effect?.runtimeId && !effect?.actions?.length) return decisionPending(state, runtimeId, context, text, trigger, "copyCommand");
    const removed = exileDiscardCard(next, context.sourcePlayerId, id);
    if (!removed) return decisionPending(state, runtimeId, context, text, trigger, "copyCommand");
    next = removed;
    return {
      state: next,
      pendingEffects: [
        {
          cardId: id,
          sourcePlayerId: context.sourcePlayerId,
          trigger: "COMMAND_RESOLVE",
          text: effect.text,
          reason: "DECISION_REQUIRED",
          decisionKey: `executeCopiedCommand:${id}`,
        },
      ],
    };
  }
  if (runtimeId === "SET001-0114:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    next = addFlag(next, target.unit.matchUnitId, "SET_STATS", next.turn + 2, cardId, { attack: 2, defense: 2 });
    next = silence(next, target.unit.matchUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0115:0") {
    const ally = selectedUnit(next, context, "ALLY_CONTROOLZ");
    const enemy = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!ally) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    if (!enemy) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    next = addFlag(next, ally.unit.matchUnitId, "CONTROL_SWAP", next.turn, cardId, { with: enemy.unit.matchUnitId });
    next = addFlag(next, enemy.unit.matchUnitId, "CONTROL_SWAP", next.turn, cardId, { with: ally.unit.matchUnitId });
    next = addFlag(next, ally.unit.matchUnitId, "CAN_ATTACK_ON_DEPLOY", next.turn, cardId);
    next = addFlag(next, enemy.unit.matchUnitId, "CAN_ATTACK_ON_DEPLOY", next.turn, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0116:0") {
    for (const unit of [...allUnits(next)]) {
      const def = cardById(catalogue, unit.unit.definitionId);
      if (def.cost <= 3) {
        next = replaceUnit(next, unit, null);
        next = updatePlayer(next, unit.unit.ownerPlayerId, (player) => ({ ...player, deck: [...player.deck, unit.unit.definitionId] }));
      }
    }
    next = drawCards(next, next.players[0].playerId, 1);
    next = drawCards(next, next.players[1].playerId, 1);
    return { state: next, pendingEffects: noPending };
  }

  // ---------------- VOID ----------------
  if (runtimeId === "SET001-0118:0") {
    const mode = context.choices?.modes?.discardToDraw;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "discardToDraw");
    if (mode !== "YES") return { state: next, pendingEffects: noPending };
    const discarded = discardChosen(next, runtimeId, context, text, trigger, "discard");
    if (discarded.pendingEffects.length) return discarded;
    return { state: drawCards(discarded.state, context.sourcePlayerId, 1), pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0120:0") {
    if (!context.sourceUnitId) return { state, pendingEffects: noPending };
    const mode = context.choices?.modes?.discardControolz;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "discardControolz");
    if (mode !== "YES") return { state: next, pendingEffects: noPending };
    const id = context.choices?.cards?.discard?.[0];
    if (!id || cardById(catalogue, id).type !== "CONTROOLZ") return decisionPending(state, runtimeId, context, text, trigger, "discard");
    const discarded = discardFromHand(next, context.sourcePlayerId, id);
    if (!discarded) return decisionPending(state, runtimeId, context, text, trigger, "discard");
    next = applyPermanent(discarded, context.sourceUnitId, 1, 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0125:0") {
    const id = context.choices?.cards?.returnFromDiscard?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const def = cardById(catalogue, id);
    if (def.type !== "CONTROOLZ" || def.cost !== 1) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
    if (!returned) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    next = returned;
    return discardChosen(next, runtimeId, context, text, trigger, "discard");
  }
  if (runtimeId === "SET001-0128:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    const hurt = callbacks.damageUnit(next, target.unit.matchUnitId, 1, context.targets, context.choices);
    next = hurt.state;
    if (findUnit(next, target.unit.matchUnitId)) next = drawCards(next, context.sourcePlayerId, 1);
    return { state: next, pendingEffects: hurt.pendingEffects };
  }
  if (runtimeId === "SET001-0129:0") {
    const id = context.choices?.cards?.returnFromDiscard?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const def = cardById(catalogue, id);
    if (def.type !== "CONTROOLZ" || def.cost > 2 || id === cardId) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
    return returned ? { state: returned, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
  }
  if (runtimeId === "SET001-0133:0") {
    const mode = context.choices?.modes?.sacrifice;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "sacrifice");
    if (mode !== "YES") return { state: next, pendingEffects: noPending };
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    const killed = callbacks.disconnectUnit(next, target.unit.matchUnitId, context.targets, context.choices);
    next = drawCards(killed.state, context.sourcePlayerId, 2);
    const discarded = discardChosen(next, runtimeId, context, text, trigger, "discard");
    return { state: discarded.state, pendingEffects: [...killed.pendingEffects, ...discarded.pendingEffects] };
  }
  if (runtimeId === "SET001-0134:0") {
    const id = context.choices?.cards?.opponentDiscard?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "opponentDiscard");
    const opponentId = getOpponent(next, context.sourcePlayerId).playerId;
    const def = cardById(catalogue, id);
    const exiled = exileDiscardCard(next, opponentId, id);
    if (!exiled) return decisionPending(state, runtimeId, context, text, trigger, "opponentDiscard");
    next = exiled;
    if (def.type === "CONTROOLZ" && context.sourceUnitId) next = applyPermanent(next, context.sourceUnitId, 1, 0);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0136:0" || runtimeId === "SET001-0137:0") {
    const maxCost = runtimeId === "SET001-0136:0" ? 3 : 4;
    const id = context.choices?.cards?.summonFromDiscard?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "summonFromDiscard");
    const def = cardById(catalogue, id);
    if (def.type !== "CONTROOLZ" || def.cost > maxCost) return decisionPending(state, runtimeId, context, text, trigger, "summonFromDiscard");
    const free = emptyLanes(next, context.sourcePlayerId);
    const laneChoice = context.choices?.numbers?.summonLane;
    const lane = free.length === 1 ? free[0] : laneChoice;
    if (lane !== 0 && lane !== 1 && lane !== 2 || !free.includes(lane)) return decisionPending(state, runtimeId, context, text, trigger, "summonLane");
    const removed = removeFromDiscard(next, context.sourcePlayerId, id);
    if (!removed) return decisionPending(state, runtimeId, context, text, trigger, "summonFromDiscard");
    const connected = connectRuntimeUnit(removed, context.sourcePlayerId, def, lane);
    next = connected.state;
    if (runtimeId === "SET001-0136:0") next = addFlag(next, connected.matchUnitId, "SELF_CARDS_CANNOT_DESTROY", next.turn, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0139:0") {
    const id = context.choices?.cards?.returnFromDiscard?.[0];
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const def = cardById(catalogue, id);
    if (def.type !== "CONTROOLZ" || def.cost > 2) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
    return returned ? { state: returned, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
  }
  if (runtimeId === "SET001-0140:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    const amount = getPlayer(next, context.sourcePlayerId).turnStats.disconnectionsTriggered > 0 ? 3 : 2;
    return callbacks.damageUnit(next, target.unit.matchUnitId, amount, context.targets, context.choices);
  }
  if (runtimeId === "SET001-0141:0") {
    next = drawCards(next, context.sourcePlayerId, 2);
    const id = context.choices?.cards?.discard?.[0];
    if (!id) return decisionPending(next, runtimeId, context, text, trigger, "discard");
    const def = cardById(catalogue, id);
    const discarded = discardFromHand(next, context.sourcePlayerId, id);
    if (!discarded) return decisionPending(next, runtimeId, context, text, trigger, "discard");
    next = discarded;
    if (def.type === "CONTROOLZ") next = changeSignal(next, context.sourcePlayerId, 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0142:0") {
    const ally = selectedUnit(next, context, "ALLY_CONTROOLZ");
    const enemy = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!ally) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    if (!enemy) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    const allyCost = cardById(catalogue, ally.unit.definitionId).cost;
    const enemyCost = cardById(catalogue, enemy.unit.definitionId).cost;
    if (enemyCost > allyCost) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    const first = callbacks.disconnectUnit(next, ally.unit.matchUnitId, context.targets, context.choices);
    const second = callbacks.disconnectUnit(first.state, enemy.unit.matchUnitId, context.targets, context.choices);
    return { state: second.state, pendingEffects: [...first.pendingEffects, ...second.pendingEffects] };
  }
  if (runtimeId === "SET001-0143:0") {
    const ownerMode = context.choices?.modes?.discardOwner;
    const ids = context.choices?.cards?.exileFromDiscard ?? [];
    if (!ownerMode) return decisionPending(state, runtimeId, context, text, trigger, "discardOwner");
    if (!context.choices?.cards?.exileFromDiscard) return decisionPending(state, runtimeId, context, text, trigger, "exileFromDiscard");
    const ownerId = ownerMode === "SELF" ? context.sourcePlayerId : getOpponent(next, context.sourcePlayerId).playerId;
    const enemy = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    const unitCount = ids.filter((id) => cardById(catalogue, id).type === "CONTROOLZ").length;
    if (unitCount > 0 && !enemy) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    for (const id of ids.slice(0, 3)) {
      const exiled = exileDiscardCard(next, ownerId, id);
      if (!exiled) return decisionPending(state, runtimeId, context, text, trigger, "exileFromDiscard");
      next = exiled;
    }
    if (enemy && unitCount > 0) return callbacks.damageUnit(next, enemy.unit.matchUnitId, unitCount, context.targets, context.choices);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0144:0") {
    const ids = context.choices?.cards?.returnFromDiscard ?? [];
    if (!context.choices?.cards?.returnFromDiscard) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    for (const id of ids.slice(0, 2)) {
      const def = cardById(catalogue, id);
      if (def.type !== "CONTROOLZ" || def.cost > 3) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
      const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
      if (!returned) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
      next = returned;
      next = addPlayerModifier(next, context.sourcePlayerId, { kind: "CARD_COST", amount: -1, expiresAtTurn: next.turn, sourceCardId: cardId, data: { definitionId: id } });
    }
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0145:0") {
    const pendingEffects: Set001RuntimePending[] = [];
    for (const unit of [...allUnits(next)]) {
      if (unit.unit.currentDefense <= 3) {
        const result = callbacks.disconnectUnit(next, unit.unit.matchUnitId, context.targets, context.choices);
        next = result.state;
        pendingEffects.push(...result.pendingEffects);
      }
    }
    return { state: next, pendingEffects };
  }

  // ---------------- PRIME ----------------
  if (runtimeId === "SET001-0149:0") {
    const target = selectedUnit(next, context, "OTHER_ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    next = addUnitModifier(next, target.unit.matchUnitId, { kind: "PREVENT_NEXT_DAMAGE", amount: 1, expiresAtTurn: next.turn, sourceCardId: cardId });
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0162:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    next = silence(next, target.unit.matchUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0166:0") {
    const targets = selectedUnits(next, context, "OTHER_ALLY_CONTROOLZ").slice(0, 2);
    if (!context.targets?.OTHER_ALLY_CONTROOLZ && getPlayer(next, context.sourcePlayerId).board.filter(Boolean).length > 1) {
      return targetPending(state, runtimeId, context, text, trigger, "OTHER_ALLY_CONTROOLZ");
    }
    for (const target of targets) next = applyPermanent(next, target.unit.matchUnitId, 0, 2);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0167:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    next = addTempDefense(next, target.unit.matchUnitId, 2, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0168:0") {
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "UNIT_DAMAGE_PREVENTION_POOL", amount: 3, expiresAtTurn: next.turn, sourceCardId: cardId });
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0169:0") {
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    next = addFlag(next, target.unit.matchUnitId, "COMMAND_DESTROY_PROTECTED", next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0170:0") {
    const targets = selectedUnits(next, context, "ALLY_CONTROOLZ").slice(0, 2);
    if (targets.length < 2) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    const amount = Math.max(0, Math.min(3, Math.trunc(context.choices?.numbers?.moveDamage ?? 0)));
    if (!amount) return decisionPending(state, runtimeId, context, text, trigger, "moveDamage");
    const from = findUnit(next, targets[0].unit.matchUnitId)!;
    const to = findUnit(next, targets[1].unit.matchUnitId)!;
    const marked = from.unit.maxDefense - from.unit.currentDefense;
    const moved = Math.min(amount, Math.max(0, marked));
    next = replaceUnit(next, from, { ...from.unit, currentDefense: from.unit.currentDefense + moved });
    return callbacks.damageUnit(next, to.unit.matchUnitId, moved, context.targets, context.choices);
  }
  if (runtimeId === "SET001-0171:0") {
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    next = addFlag(next, target.unit.matchUnitId, "CANNOT_ATTACK_CONTROLLER", next.turn + 2, cardId);
    next = addFlag(next, target.unit.matchUnitId, "NO_ON_ATTACK", next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0172:0") {
    for (const unit of allUnits(next).filter((entry) => entry.playerIndex === getPlayerIndex(next, context.sourcePlayerId))) {
      if (unit.unit.currentDefense >= unit.unit.attack) next = addTempAttack(next, unit.unit.matchUnitId, 2, next.turn, cardId);
    }
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0173:0") {
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "PREVENT_ALL_SIGNAL_DAMAGE", expiresAtTurn: next.turn + 2, sourceCardId: cardId });
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "CANNOT_DAMAGE_ENEMY_SIGNAL", expiresAtTurn: next.turn + 2, sourceCardId: cardId });
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0174:0") {
    for (const enemy of allUnits(next).filter((entry) => entry.playerIndex !== getPlayerIndex(next, context.sourcePlayerId))) {
      next = addTempAttack(next, enemy.unit.matchUnitId, -3, next.turn + 2, cardId);
    }
    return { state: next, pendingEffects: noPending };
  }

  // ---------------- NEUTRAL ----------------
  if (runtimeId === "SET001-0178:0") {
    next = setRuntimeCounter(next, context.sourcePlayerId, `peekEnemyTop:${getOpponent(next, context.sourcePlayerId).deck[0] ?? "EMPTY"}`, 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0181:0") {
    const opponentId = getOpponent(next, context.sourcePlayerId).playerId;
    if (getPlayer(next, context.sourcePlayerId).signal < getPlayer(next, opponentId).signal) next = changeSignal(next, context.sourcePlayerId, 2);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0183:0") {
    const ownerMode = context.choices?.modes?.discardOwner;
    const id = context.choices?.cards?.exileFromDiscard?.[0];
    if (!ownerMode) return decisionPending(state, runtimeId, context, text, trigger, "discardOwner");
    if (!id) return decisionPending(state, runtimeId, context, text, trigger, "exileFromDiscard");
    const ownerId = ownerMode === "SELF" ? context.sourcePlayerId : getOpponent(next, context.sourcePlayerId).playerId;
    const exiled = exileDiscardCard(next, ownerId, id);
    return exiled ? { state: exiled, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "exileFromDiscard");
  }
  if (runtimeId === "SET001-0187:0") {
    const mode = context.choices?.modes?.returnCost1;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "returnCost1");
    if (mode !== "YES") return { state: next, pendingEffects: noPending };
    const target = selectedUnit(next, context, "ALLY_CONTROOLZ");
    if (!target || cardById(catalogue, target.unit.definitionId).cost !== 1) return targetPending(state, runtimeId, context, text, trigger, "ALLY_CONTROOLZ");
    next = returnUnitToHand(next, target.unit.matchUnitId);
    next = addPlayerModifier(next, context.sourcePlayerId, { kind: "NEXT_CONTROOLZ_COST", amount: -1, expiresAtTurn: next.turn, sourceCardId: cardId });
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0190:0") {
    next = drawCards(next, context.sourcePlayerId, 1);
    return discardChosen(next, runtimeId, context, text, trigger, "discard");
  }
  if (runtimeId === "SET001-0191:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    next = silence(next, target.unit.matchUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0193:0") {
    const chosen = context.choices?.cards?.takeFromTop?.[0];
    if (!chosen) return decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
    const top = getPlayer(next, context.sourcePlayerId).deck.slice(0, 5);
    if (!top.includes(chosen)) return decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
    const def = cardById(catalogue, chosen);
    const allyClasses = new Set(
      getPlayer(next, context.sourcePlayerId).board
        .filter((unit): unit is UnitState => Boolean(unit))
        .map((unit) => cardById(catalogue, unit.definitionId).cardClass),
    );
    if (def.cardClass !== "NEUTRAL" && !allyClasses.has(def.cardClass)) return decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
    const committed = commitTopSelectionToHand(next, context.sourcePlayerId, 5, [chosen]);
    return committed ? { state: committed, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
  }
  if (runtimeId === "SET001-0194:0") {
    const opponent = getOpponent(next, context.sourcePlayerId);
    const candidates = opponent.board.filter((unit): unit is UnitState => Boolean(unit)).filter((unit) => {
      const def = cardById(catalogue, unit.definitionId);
      return def.cost === 6 || def.cost === 7;
    });
    if (!candidates.length) return { state: next, pendingEffects: noPending };
    const target = selectedUnit(next, context, "ENEMY_CONTROOLZ");
    if (!target || !candidates.some((unit) => unit.matchUnitId === target.unit.matchUnitId)) return targetPending(state, runtimeId, context, text, trigger, "ENEMY_CONTROOLZ");
    next = silence(next, target.unit.matchUnitId, next.turn + 2, cardId);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0196:0") {
    const chosen = context.choices?.cards?.takeFromTop?.[0];
    const top = getPlayer(next, context.sourcePlayerId).deck.slice(0, 3);
    if (chosen && (!top.includes(chosen) || cardById(catalogue, chosen).type !== "CONTROOLZ")) return decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
    if (!context.choices?.cards?.takeFromTop) return decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
    const committed = commitTopSelectionToHand(next, context.sourcePlayerId, 3, chosen ? [chosen] : []);
    return committed ? { state: committed, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "takeFromTop");
  }
  if (runtimeId === "SET001-0197:0") {
    const controller = context.choices?.modes?.controller;
    if (!controller) return decisionPending(state, runtimeId, context, text, trigger, "controller");
    const playerId = controller === "SELF" ? context.sourcePlayerId : getOpponent(next, context.sourcePlayerId).playerId;
    next = addPlayerModifier(next, playerId, { kind: "PREVENT_SIGNAL_DAMAGE_POOL", amount: 3, expiresAtTurn: next.turn + 2, sourceCardId: cardId });
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0198:0") {
    const mode = context.choices?.modes?.reserveMode;
    if (!mode) return decisionPending(state, runtimeId, context, text, trigger, "reserveMode");
    if (mode === "RETURN") {
      const id = context.choices?.cards?.returnFromDiscard?.[0];
      if (!id || cardById(catalogue, id).cost > 3) return decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
      const returned = returnDiscardCardToHand(next, context.sourcePlayerId, id);
      return returned ? { state: returned, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "returnFromDiscard");
    }
    if (mode === "EXILE") {
      const id = context.choices?.cards?.opponentDiscard?.[0];
      if (!id) return decisionPending(state, runtimeId, context, text, trigger, "opponentDiscard");
      const opponentId = getOpponent(next, context.sourcePlayerId).playerId;
      const exiled = exileDiscardCard(next, opponentId, id);
      return exiled ? { state: exiled, pendingEffects: noPending } : decisionPending(state, runtimeId, context, text, trigger, "opponentDiscard");
    }
    return decisionPending(state, runtimeId, context, text, trigger, "reserveMode");
  }
  if (runtimeId === "SET001-0199:0") {
    const target = selectedUnit(next, context, "ANY_CONTROOLZ");
    if (!target) return targetPending(state, runtimeId, context, text, trigger, "ANY_CONTROOLZ");
    const ownerId = target.unit.ownerPlayerId;
    next = returnUnitToHand(next, target.unit.matchUnitId);
    next = drawCards(next, ownerId, 1);
    return { state: next, pendingEffects: noPending };
  }
  if (runtimeId === "SET001-0200:0") {
    for (const unit of allUnits(next)) {
      const def = cardById(catalogue, unit.unit.definitionId);
      if (def.type !== "CONTROOLZ") continue;
      next = replaceUnit(next, unit, {
        ...unit.unit,
        attack: def.attack,
        maxDefense: def.defense,
        currentDefense: Math.min(def.defense, Math.max(1, unit.unit.currentDefense)),
      });
      next = removeUnitModifiers(next, unit.unit.matchUnitId, () => true);
      next = silence(next, unit.unit.matchUnitId, next.turn, cardId);
    }
    return { state: next, pendingEffects: noPending };
  }

  return null;
}

export function resolveSet001RuntimeEffectAll(
  baseResult: Set001RuntimeResult,
  state: MatchState,
  runtimeId: string,
  text: string,
  trigger: Set001RuntimePending["trigger"],
  catalogue: readonly CardDefinition[],
  context: Set001RuntimeContext,
  callbacks: Set001RuntimeCallbacks,
): Set001RuntimeResult {
  if (!isUnsupported(baseResult, runtimeId)) return baseResult;
  return resolveSet001ExtraRuntimeEffect(state, runtimeId, text, trigger, catalogue, context, callbacks) ?? baseResult;
}
