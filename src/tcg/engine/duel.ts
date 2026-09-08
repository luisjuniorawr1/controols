import type {
  CardDefinition,
  CardEffect,
  EffectAction,
  LaneIndex,
  MatchState,
  PlayerMatchState,
  TargetSelector,
  UnitState,
} from "../domain";
import { getSet001TokenDefinition } from "../cards/set001/tokens";
import { DEFAULT_GAME_RULES, type GameRulesConfig } from "../rules";
import {
  changeSignal,
  drawCards,
  getOpponent,
  getOpponentIndex,
  getPlayer,
  getPlayerIndex,
  preparePlayerTurn,
  replacePlayer,
  spendEnergy,
  updatePlayer,
} from "./match";
import {
  addPlayerModifier,
  addUnitModifier,
  getPlayerModifiers,
  getRuntimeCounter,
  getUnitModifiers,
  removePlayerModifiers,
  setRuntimeCounter,
} from "./runtime-state";
import {
  afterSet001CardPaid,
  canSet001AttackOnDeploy,
  canSet001UnitAttackAtAll,
  canSet001UnitAttackController,
  clearSet001UnitRuntime,
  getSet001EffectiveCost,
  getSet001MaxAttacksThisTurn,
  resolveSet001RuntimeEffect,
  type RuntimeChoiceBindings,
  type RuntimeTargetBindings,
  type Set001RuntimeCallbacks,
  type Set001RuntimePending,
  type Set001RuntimeResult,
} from "./set001-runtime";
import { resolveSet001RuntimeEffectAll } from "./set001-runtime-extra";
import {
  afterSet001AttackResolved,
  afterSet001CardLeavesDiscard,
  afterSet001CardPlayed,
  afterSet001DefenseRecovered,
  afterSet001Disconnection,
  afterSet001StatsSwapped,
  afterSet001TurnStart,
  afterSet001UnitConnected,
  afterSet001UnitDamaged,
  afterSet001UnitReturnedToHand,
  applySet001PreSignalDamage,
  applySet001PreUnitDamage,
  beforeSet001UnitWouldDisconnectFromDamage,
  getSet001EffectiveAttack,
  getSet001TauntTarget,
  isSet001CommandTargetProtected,
  prepareSet001CommandTargeting,
  recordSet001SignalDamage,
  resolveSet001EndTurnDamage,
} from "./set001-events";

export type EffectTargetBindings = RuntimeTargetBindings;

export interface PendingEffect {
  cardId: string;
  sourcePlayerId: string;
  sourceUnitId?: string;
  trigger: CardEffect["trigger"];
  text: string;
  reason:
    | "TARGET_REQUIRED"
    | "DECISION_REQUIRED"
    | "UNSTRUCTURED_EFFECT"
    | "UNSUPPORTED_TEMPORARY_MODIFIER"
    | "UNSUPPORTED_ACTION";
  requiredTarget?: TargetSelector;
  decisionKey?: string;
}

export interface EngineResult {
  state: MatchState;
  pendingEffects: readonly PendingEffect[];
}

export interface EffectContext {
  sourcePlayerId: string;
  sourceUnitId?: string;
  targets?: EffectTargetBindings;
  choices?: RuntimeChoiceBindings;
}

interface UnitLocation {
  playerIndex: 0 | 1;
  lane: LaneIndex;
  unit: UnitState;
}

function getCard(
  catalogue: readonly CardDefinition[],
  definitionId: string,
): CardDefinition {
  const card =
    catalogue.find((item) => item.id === definitionId) ??
    getSet001TokenDefinition(definitionId);
  if (!card) throw new Error(`Carta desconhecida: ${definitionId}.`);
  return card;
}

function assertActivePlayer(state: MatchState, playerId: string): void {
  if (state.outcome) throw new Error("A partida já terminou.");
  if (state.activePlayerId !== playerId) {
    throw new Error("Não é o turno deste Controller.");
  }
}

function assertPhase(state: MatchState, phase: "CONTROL" | "COMBAT"): void {
  if (state.phase !== phase) {
    throw new Error(`A ação exige a fase ${phase}; fase atual: ${state.phase}.`);
  }
}

function removeOneFromHand(
  player: PlayerMatchState,
  definitionId: string,
): PlayerMatchState {
  const index = player.hand.indexOf(definitionId);
  if (index < 0) throw new Error(`A carta ${definitionId} não está na mão.`);
  return {
    ...player,
    hand: [...player.hand.slice(0, index), ...player.hand.slice(index + 1)],
  };
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

function allUnitLocations(state: MatchState): UnitLocation[] {
  const result: UnitLocation[] = [];
  for (const playerIndex of [0, 1] as const) {
    for (const lane of [0, 1, 2] as const) {
      const unit = state.players[playerIndex].board[lane];
      if (unit) result.push({ playerIndex, lane, unit });
    }
  }
  return result;
}

function replaceUnitAt(
  state: MatchState,
  playerIndex: 0 | 1,
  lane: LaneIndex,
  unit: UnitState | null,
): MatchState {
  const player = state.players[playerIndex];
  const board = [...player.board] as [UnitState | null, UnitState | null, UnitState | null];
  board[lane] = unit;
  return replacePlayer(state, playerIndex, { ...player, board });
}

function isUnitSilenced(state: MatchState, unitId: string): boolean {
  return getUnitModifiers(state, unitId).some(
    (modifier) =>
      modifier.kind === "SILENCED" &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
}

function hasUnitRuntimeFlag(state: MatchState, unitId: string, kind: string): boolean {
  return getUnitModifiers(state, unitId).some(
    (modifier) =>
      modifier.kind === kind &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
}

function targetNeedsExplicitBinding(selector: TargetSelector): boolean {
  return (
    selector === "ALLY_CONTROOLZ" ||
    selector === "OTHER_ALLY_CONTROOLZ" ||
    selector === "ENEMY_CONTROOLZ" ||
    selector === "ANY_CONTROOLZ" ||
    selector === "RANDOM_ALLY_CONTROOLZ" ||
    selector === "RANDOM_ENEMY_CONTROOLZ"
  );
}

function actionTarget(action: EffectAction): TargetSelector | null {
  switch (action.type) {
    case "DEAL_DAMAGE":
    case "RESTORE_DEFENSE":
    case "MODIFY_ATTACK":
    case "MODIFY_DEFENSE":
    case "DESTROY":
    case "RETURN_TO_HAND":
      return action.target;
    default:
      return null;
  }
}

function missingTargetForEffect(
  effect: CardEffect,
  context: EffectContext,
): TargetSelector | null {
  for (const action of effect.actions ?? []) {
    const selector = actionTarget(action);
    if (!selector || !targetNeedsExplicitBinding(selector)) continue;
    if (!context.targets?.[selector]?.length) return selector;
  }
  return null;
}

function resolveUnitTargets(
  state: MatchState,
  selector: TargetSelector,
  context: EffectContext,
): UnitLocation[] {
  const sourceIndex = getPlayerIndex(state, context.sourcePlayerId);
  const opponentIndex = sourceIndex === 0 ? 1 : 0;
  const all = allUnitLocations(state);

  switch (selector) {
    case "SELF": {
      if (!context.sourceUnitId) return [];
      const found = findUnit(state, context.sourceUnitId);
      return found ? [found] : [];
    }
    case "ALL_ALLY_CONTROOLZ":
      return all.filter((entry) => entry.playerIndex === sourceIndex);
    case "ALL_ENEMY_CONTROOLZ":
      return all.filter((entry) => entry.playerIndex === opponentIndex);
    case "ALL_OTHER_CONTROOLZ":
      return all.filter((entry) => entry.unit.matchUnitId !== context.sourceUnitId);
    case "ALLY_CONTROOLZ":
    case "OTHER_ALLY_CONTROOLZ":
    case "ENEMY_CONTROOLZ":
    case "ANY_CONTROOLZ":
    case "RANDOM_ALLY_CONTROOLZ":
    case "RANDOM_ENEMY_CONTROOLZ": {
      const ids = context.targets?.[selector] ?? [];
      return ids
        .map((id) => findUnit(state, id))
        .filter((entry): entry is UnitLocation => Boolean(entry))
        .filter((entry) => {
          if (
            selector === "ALLY_CONTROOLZ" ||
            selector === "RANDOM_ALLY_CONTROOLZ"
          ) {
            return entry.playerIndex === sourceIndex;
          }
          if (selector === "OTHER_ALLY_CONTROOLZ") {
            return (
              entry.playerIndex === sourceIndex &&
              entry.unit.matchUnitId !== context.sourceUnitId
            );
          }
          if (
            selector === "ENEMY_CONTROOLZ" ||
            selector === "RANDOM_ENEMY_CONTROOLZ"
          ) {
            return entry.playerIndex === opponentIndex;
          }
          return true;
        });
    }
    case "ALLY_CONTROLLER":
    case "ENEMY_CONTROLLER":
      return [];
  }
}

function addToDiscard(
  state: MatchState,
  ownerPlayerId: string,
  definitionId: string,
): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    discard: [...player.discard, definitionId],
  }));
}

function addToHand(
  state: MatchState,
  ownerPlayerId: string,
  definitionId: string,
): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    hand: [...player.hand, definitionId],
  }));
}

function incrementDestroyedStat(
  state: MatchState,
  ownerPlayerId: string,
): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      unitsDestroyed: player.turnStats.unitsDestroyed + 1,
    },
  }));
}

function incrementDisconnectionStat(
  state: MatchState,
  ownerPlayerId: string,
): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      disconnectionsTriggered: player.turnStats.disconnectionsTriggered + 1,
    },
  }));
}

function recordUnitDamage(
  state: MatchState,
  ownerPlayerId: string,
  amount: number,
): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      damageTaken: player.turnStats.damageTaken + amount,
    },
  }));
}

function afterAnyUnitStatsAltered(state: MatchState, unitId: string): MatchState {
  const location = findUnit(state, unitId);
  if (!location || location.unit.definitionId !== "SET001-0182") return state;
  const key = `mascoteStat:${unitId}`;
  if (getRuntimeCounter(state, location.unit.ownerPlayerId, key) > 0) return state;
  let next = addUnitModifier(state, unitId, {
    kind: "TEMP_DEFENSE",
    amount: 1,
    expiresAtTurn: state.turn,
    sourceCardId: "SET001-0182",
  });
  next = setRuntimeCounter(next, location.unit.ownerPlayerId, key, 1);
  return next;
}

function modifyUnitPermanent(
  state: MatchState,
  target: UnitLocation,
  attackDelta: number,
  defenseDelta: number,
): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return state;
  const nextMaxDefense = Math.max(1, fresh.unit.maxDefense + defenseDelta);
  const nextCurrentDefense = Math.max(
    0,
    Math.min(nextMaxDefense, fresh.unit.currentDefense + defenseDelta),
  );
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, {
    ...fresh.unit,
    attack: Math.max(0, fresh.unit.attack + attackDelta),
    maxDefense: nextMaxDefense,
    currentDefense: nextCurrentDefense,
  });
  next = afterAnyUnitStatsAltered(next, fresh.unit.matchUnitId);
  return next;
}

function restoreUnitDefense(
  state: MatchState,
  target: UnitLocation,
  amount: number,
  catalogue: readonly CardDefinition[],
): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh || hasUnitRuntimeFlag(state, fresh.unit.matchUnitId, "CANNOT_RECEIVE_DEF")) {
    return state;
  }
  const before = fresh.unit.currentDefense;
  const after = Math.min(
    fresh.unit.maxDefense,
    fresh.unit.currentDefense + Math.max(0, amount),
  );
  if (after === before) return state;
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, {
    ...fresh.unit,
    currentDefense: after,
  });
  next = afterSet001DefenseRecovered(
    next,
    fresh.unit.matchUnitId,
    after - before,
    catalogue,
  );
  return next;
}

function returnUnitToHand(
  state: MatchState,
  target: UnitLocation,
  choices?: RuntimeChoiceBindings,
): EngineResult {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return { state, pendingEffects: [] };
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, null);
  next = addToHand(next, fresh.unit.ownerPlayerId, fresh.unit.definitionId);
  next = clearSet001UnitRuntime(next, fresh.unit.matchUnitId);
  const event = afterSet001UnitReturnedToHand(
    next,
    fresh.unit.ownerPlayerId,
    fresh.unit.definitionId,
    choices,
  );
  return { state: event.state, pendingEffects: runtimePendingToEngine(event.pendingEffects) };
}

function destroyUnitWithoutTrigger(state: MatchState, target: UnitLocation): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return state;
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, null);
  next = addToDiscard(next, fresh.unit.ownerPlayerId, fresh.unit.definitionId);
  next = incrementDestroyedStat(next, fresh.unit.ownerPlayerId);
  next = clearSet001UnitRuntime(next, fresh.unit.matchUnitId);
  return next;
}

function runtimePendingToEngine(
  pending: readonly Set001RuntimePending[],
): PendingEffect[] {
  return pending.map((item) => ({ ...item }));
}

function enginePendingToRuntime(
  pending: readonly PendingEffect[],
): Set001RuntimePending[] {
  return pending.map((item) => ({
    cardId: item.cardId,
    sourcePlayerId: item.sourcePlayerId,
    sourceUnitId: item.sourceUnitId,
    trigger: item.trigger,
    text: item.text,
    reason:
      item.reason === "TARGET_REQUIRED" ||
      item.reason === "DECISION_REQUIRED" ||
      item.reason === "UNSUPPORTED_ACTION"
        ? item.reason
        : "UNSUPPORTED_ACTION",
    requiredTarget: item.requiredTarget,
    decisionKey: item.decisionKey,
  }));
}

function toRuntimeResult(result: EngineResult): Set001RuntimeResult {
  return { state: result.state, pendingEffects: enginePendingToRuntime(result.pendingEffects) };
}

function snapshotBoard(
  state: MatchState,
): Map<string, { ownerPlayerId: string; definitionId: string }> {
  return new Map(
    allUnitLocations(state).map((entry) => [
      entry.unit.matchUnitId,
      {
        ownerPlayerId: entry.unit.ownerPlayerId,
        definitionId: entry.unit.definitionId,
      },
    ]),
  );
}

function countCard(values: readonly string[], definitionId: string): number {
  return values.filter((value) => value === definitionId).length;
}

function detectRuntimeSideEffects(
  before: MatchState,
  after: MatchState,
  context: EffectContext,
  catalogue: readonly CardDefinition[],
): EngineResult {
  let next = after;
  const pending: PendingEffect[] = [];
  const beforeBoard = snapshotBoard(before);

  for (const [unitId, prior] of beforeBoard) {
    if (findUnit(next, unitId)) continue;
    const beforePlayer = getPlayer(before, prior.ownerPlayerId);
    const afterPlayer = getPlayer(next, prior.ownerPlayerId);
    if (
      countCard(afterPlayer.hand, prior.definitionId) >
      countCard(beforePlayer.hand, prior.definitionId)
    ) {
      const event = afterSet001UnitReturnedToHand(
        next,
        prior.ownerPlayerId,
        prior.definitionId,
        context.choices,
      );
      next = event.state;
      pending.push(...runtimePendingToEngine(event.pendingEffects));
    }
  }

  for (const player of before.players) {
    const priorDiscard = getPlayer(before, player.playerId).discard;
    const currentDiscard = getPlayer(next, player.playerId).discard;
    const ids = new Set(priorDiscard);
    for (const id of ids) {
      if (countCard(currentDiscard, id) < countCard(priorDiscard, id)) {
        next = afterSet001CardLeavesDiscard(next, player.playerId);
      }
    }
  }

  const beforeSwapCounts = new Map<string, number>();
  for (const entry of allUnitLocations(before)) {
    beforeSwapCounts.set(
      entry.unit.matchUnitId,
      getUnitModifiers(before, entry.unit.matchUnitId).filter(
        (modifier) => modifier.kind === "SWAP_STATS",
      ).length,
    );
  }
  for (const entry of allUnitLocations(next)) {
    const prior = beforeSwapCounts.get(entry.unit.matchUnitId) ?? 0;
    const current = getUnitModifiers(next, entry.unit.matchUnitId).filter(
      (modifier) => modifier.kind === "SWAP_STATS",
    ).length;
    if (current > prior) {
      const event = afterSet001StatsSwapped(
        next,
        entry.unit.matchUnitId,
        context.sourcePlayerId,
        context.choices,
      );
      next = event.state;
      pending.push(...runtimePendingToEngine(event.pendingEffects));
    }
  }

  void catalogue;
  return { state: next, pendingEffects: pending };
}

function runtimeCallbacks(
  catalogue: readonly CardDefinition[],
  context: EffectContext,
): Set001RuntimeCallbacks {
  return {
    damageUnit: (
      state,
      matchUnitId,
      amount,
      targets,
      choices,
    ) => {
      const sourceDefinition = context.sourceUnitId
        ? findUnit(state, context.sourceUnitId)?.unit.definitionId
        : undefined;
      return toRuntimeResult(
        damageUnit(
          state,
          matchUnitId,
          amount,
          catalogue,
          targets,
          choices,
          context.sourcePlayerId,
          sourceDefinition,
        ),
      );
    },
    disconnectUnit: (
      state,
      matchUnitId,
      targets,
      choices,
    ) => toRuntimeResult(disconnectUnit(state, matchUnitId, catalogue, targets, choices)),
    resolveConnection: (
      state,
      definitionId,
      sourcePlayerId,
      sourceUnitId,
      targets,
      choices,
    ) =>
      toRuntimeResult(
        resolveCardTrigger(
          state,
          getCard(catalogue, definitionId),
          "CONNECTION",
          catalogue,
          { sourcePlayerId, sourceUnitId, targets, choices },
        ),
      ),
  };
}

function resolveRuntimeFollowups(
  result: EngineResult,
  catalogue: readonly CardDefinition[],
  context: EffectContext,
): EngineResult {
  let next = result.state;
  const remaining: PendingEffect[] = [];
  for (const item of result.pendingEffects) {
    if (
      item.reason === "DECISION_REQUIRED" &&
      item.decisionKey?.startsWith("executeCopiedCommand:")
    ) {
      const definitionId = item.decisionKey.slice("executeCopiedCommand:".length);
      const copied = resolveCardTrigger(
        next,
        getCard(catalogue, definitionId),
        "COMMAND_RESOLVE",
        catalogue,
        context,
      );
      next = copied.state;
      remaining.push(...copied.pendingEffects);
    } else {
      remaining.push(item);
    }
  }
  return { state: next, pendingEffects: remaining };
}

export function resolveCardTrigger(
  state: MatchState,
  card: CardDefinition,
  trigger: CardEffect["trigger"],
  catalogue: readonly CardDefinition[],
  context: EffectContext,
): EngineResult {
  if (
    context.sourceUnitId &&
    isUnitSilenced(state, context.sourceUnitId) &&
    trigger !== "DISCONNECTION"
  ) {
    return { state, pendingEffects: [] };
  }

  const effects = card.effects?.filter((effect) => effect.trigger === trigger) ?? [];
  let next = state;
  const pending: PendingEffect[] = [];

  for (const effect of effects) {
    if (effect.actions?.length) {
      const missingTarget = missingTargetForEffect(effect, context);
      if (missingTarget) {
        pending.push({
          cardId: card.id,
          sourcePlayerId: context.sourcePlayerId,
          sourceUnitId: context.sourceUnitId,
          trigger,
          text: effect.text,
          reason: "TARGET_REQUIRED",
          requiredTarget: missingTarget,
        });
        continue;
      }
      for (const action of effect.actions) {
        const applied = applyEffectAction(next, action, catalogue, context, card.id);
        next = applied.state;
        pending.push(...applied.pendingEffects);
      }
      continue;
    }

    if (effect.runtimeId) {
      const before = next;
      const core = resolveSet001RuntimeEffect(
        next,
        effect.runtimeId,
        effect.text,
        trigger,
        catalogue,
        context,
        runtimeCallbacks(catalogue, context),
      );
      const resolved = resolveSet001RuntimeEffectAll(
        core,
        next,
        effect.runtimeId,
        effect.text,
        trigger,
        catalogue,
        context,
        runtimeCallbacks(catalogue, context),
      );
      next = resolved.state;
      pending.push(...runtimePendingToEngine(resolved.pendingEffects));
      const sideEffects = detectRuntimeSideEffects(before, next, context, catalogue);
      next = sideEffects.state;
      pending.push(...sideEffects.pendingEffects);
      continue;
    }

    pending.push({
      cardId: card.id,
      sourcePlayerId: context.sourcePlayerId,
      sourceUnitId: context.sourceUnitId,
      trigger,
      text: effect.text,
      reason: "UNSTRUCTURED_EFFECT",
    });
  }

  return resolveRuntimeFollowups({ state: next, pendingEffects: pending }, catalogue, context);
}

function invalidResolvedTargetPending(
  context: EffectContext,
  selector: TargetSelector,
): PendingEffect {
  return {
    cardId: "RUNTIME",
    sourcePlayerId: context.sourcePlayerId,
    sourceUnitId: context.sourceUnitId,
    trigger: "PASSIVE",
    text: "O alvo informado não é válido para este efeito.",
    reason: "TARGET_REQUIRED",
    requiredTarget: selector,
  };
}

function deterministicIndex(state: MatchState, salt: string, length: number): number {
  if (length <= 1) return 0;
  const input = `${state.matchId}|${state.turn}|${state.runtime?.sequence ?? 0}|${salt}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function damageSignal(
  state: MatchState,
  targetPlayerId: string,
  sourcePlayerId: string,
  amount: number,
): MatchState {
  if (amount <= 0) return state;
  const prepared = applySet001PreSignalDamage(
    state,
    targetPlayerId,
    sourcePlayerId,
    amount,
  );
  if (prepared.amount <= 0) return prepared.state;
  let next = changeSignal(prepared.state, targetPlayerId, -prepared.amount);
  next = recordSet001SignalDamage(next, targetPlayerId, prepared.amount);
  return next;
}

function applyEffectAction(
  state: MatchState,
  action: EffectAction,
  catalogue: readonly CardDefinition[],
  context: EffectContext,
  sourceCardId: string,
): EngineResult {
  let next = state;
  const pending: PendingEffect[] = [];
  const ownerPlayerId = context.sourcePlayerId;
  const opponentPlayerId = getOpponent(state, ownerPlayerId).playerId;

  if (action.type === "CHANGE_SIGNAL") {
    const playerId = action.player === "SELF" ? ownerPlayerId : opponentPlayerId;
    if (action.amount < 0) {
      return {
        state: damageSignal(next, playerId, ownerPlayerId, Math.abs(action.amount)),
        pendingEffects: [],
      };
    }
    return { state: changeSignal(next, playerId, action.amount), pendingEffects: [] };
  }

  if (action.type === "CHANGE_ENERGY") {
    const playerId = action.player === "SELF" ? ownerPlayerId : opponentPlayerId;
    next = updatePlayer(next, playerId, (player) => ({
      ...player,
      energy: Math.max(0, player.energy + action.amount),
    }));
    return { state: next, pendingEffects: [] };
  }

  if (action.type === "DRAW") {
    const playerId =
      (action.player ?? "SELF") === "SELF" ? ownerPlayerId : opponentPlayerId;
    if (
      getPlayerModifiers(next, playerId).some(
        (modifier) =>
          modifier.kind === "NO_MORE_DRAW" &&
          (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= next.turn),
      )
    ) {
      return { state: next, pendingEffects: [] };
    }
    return { state: drawCards(next, playerId, action.amount), pendingEffects: [] };
  }

  if (action.type === "DISCARD_RANDOM") {
    const playerId = action.player === "SELF" ? ownerPlayerId : opponentPlayerId;
    for (let count = 0; count < action.amount; count += 1) {
      const player = getPlayer(next, playerId);
      if (!player.hand.length) break;
      const index = deterministicIndex(next, `${sourceCardId}:${count}`, player.hand.length);
      const selected = player.hand[index];
      next = updatePlayer(next, playerId, (current) => ({
        ...current,
        hand: [...current.hand.slice(0, index), ...current.hand.slice(index + 1)],
        discard: [...current.discard, selected],
      }));
    }
    return { state: next, pendingEffects: [] };
  }

  const selector = actionTarget(action);
  if (!selector) {
    return {
      state: next,
      pendingEffects: [
        {
          cardId: sourceCardId,
          sourcePlayerId: ownerPlayerId,
          sourceUnitId: context.sourceUnitId,
          trigger: "PASSIVE",
          text: "Ação de efeito ainda não suportada pelo runtime.",
          reason: "UNSUPPORTED_ACTION",
        },
      ],
    };
  }

  const targets = resolveUnitTargets(next, selector, context);
  if (targetNeedsExplicitBinding(selector) && targets.length === 0) {
    return {
      state: next,
      pendingEffects: [invalidResolvedTargetPending(context, selector)],
    };
  }

  if (action.type === "RESTORE_DEFENSE") {
    for (const target of targets) {
      next = restoreUnitDefense(next, target, action.amount, catalogue);
    }
    return { state: next, pendingEffects: [] };
  }

  if (action.type === "MODIFY_ATTACK" || action.type === "MODIFY_DEFENSE") {
    for (const target of targets) {
      if (action.duration === "TURN") {
        next = addUnitModifier(next, target.unit.matchUnitId, {
          kind: action.type === "MODIFY_ATTACK" ? "TEMP_ATTACK" : "TEMP_DEFENSE",
          amount: action.amount,
          expiresAtTurn: next.turn,
          sourceCardId,
        });
        next = afterAnyUnitStatsAltered(next, target.unit.matchUnitId);
      } else {
        next = modifyUnitPermanent(
          next,
          target,
          action.type === "MODIFY_ATTACK" ? action.amount : 0,
          action.type === "MODIFY_DEFENSE" ? action.amount : 0,
        );
      }
    }
    return { state: next, pendingEffects: [] };
  }

  if (action.type === "RETURN_TO_HAND") {
    for (const target of targets) {
      const result = returnUnitToHand(next, target, context.choices);
      next = result.state;
      pending.push(...result.pendingEffects);
    }
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "DESTROY") {
    for (const target of targets) {
      const result = disconnectUnit(
        next,
        target.unit.matchUnitId,
        catalogue,
        context.targets,
        context.choices,
      );
      next = result.state;
      pending.push(...result.pendingEffects);
    }
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "DEAL_DAMAGE") {
    for (const target of targets) {
      const result = damageUnit(
        next,
        target.unit.matchUnitId,
        action.amount,
        catalogue,
        context.targets,
        context.choices,
        ownerPlayerId,
        sourceCardId,
      );
      next = result.state;
      pending.push(...result.pendingEffects);
    }
    return { state: next, pendingEffects: pending };
  }

  return { state: next, pendingEffects: pending };
}

export function disconnectUnit(
  state: MatchState,
  matchUnitId: string,
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
  choices?: RuntimeChoiceBindings,
): EngineResult {
  const location = findUnit(state, matchUnitId);
  if (!location) return { state, pendingEffects: [] };
  const card = getCard(catalogue, location.unit.definitionId);
  const hasDisconnection = Boolean(
    card.effects?.some((effect) => effect.trigger === "DISCONNECTION"),
  );

  let next = destroyUnitWithoutTrigger(state, location);
  if (hasDisconnection) {
    next = incrementDisconnectionStat(next, location.unit.ownerPlayerId);
  }

  const own = resolveCardTrigger(next, card, "DISCONNECTION", catalogue, {
    sourcePlayerId: location.unit.ownerPlayerId,
    sourceUnitId: matchUnitId,
    targets,
    choices,
  });
  next = own.state;
  const passive = afterSet001Disconnection(
    next,
    location.unit.ownerPlayerId,
    location.unit.definitionId,
    catalogue,
    runtimeCallbacks(catalogue, {
      sourcePlayerId: location.unit.ownerPlayerId,
      sourceUnitId: matchUnitId,
      targets,
      choices,
    }),
    targets,
    choices,
  );
  return {
    state: passive.state,
    pendingEffects: [
      ...own.pendingEffects,
      ...runtimePendingToEngine(passive.pendingEffects),
    ],
  };
}

export function damageUnit(
  state: MatchState,
  matchUnitId: string,
  amount: number,
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
  choices?: RuntimeChoiceBindings,
  sourcePlayerId?: string,
  sourceCardId?: string,
): EngineResult {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Quantidade de dano inválida.");
  }
  const initial = findUnit(state, matchUnitId);
  if (!initial || amount === 0) return { state, pendingEffects: [] };

  const prepared = applySet001PreUnitDamage(
    state,
    matchUnitId,
    amount,
    catalogue,
  );
  let next = prepared.state;
  if (prepared.amount <= 0) return { state: next, pendingEffects: [] };

  const location = findUnit(next, matchUnitId);
  if (!location) return { state: next, pendingEffects: [] };
  const nextDefense = location.unit.currentDefense - prepared.amount;
  next = replaceUnitAt(next, location.playerIndex, location.lane, {
    ...location.unit,
    currentDefense: nextDefense,
  });
  next = recordUnitDamage(next, location.unit.ownerPlayerId, prepared.amount);

  if (nextDefense > 0) {
    next = afterSet001UnitDamaged(
      next,
      matchUnitId,
      sourcePlayerId,
      sourceCardId,
      catalogue,
    );
    const unit = findUnit(next, matchUnitId);
    if (unit) {
      return resolveCardTrigger(
        next,
        getCard(catalogue, unit.unit.definitionId),
        "ON_DAMAGE",
        catalogue,
        {
          sourcePlayerId: unit.unit.ownerPlayerId,
          sourceUnitId: matchUnitId,
          targets,
          choices,
        },
      );
    }
    return { state: next, pendingEffects: [] };
  }

  const replacement = beforeSet001UnitWouldDisconnectFromDamage(
    next,
    matchUnitId,
    catalogue,
  );
  next = replacement.state;
  if (replacement.survives) {
    next = afterSet001UnitDamaged(
      next,
      matchUnitId,
      sourcePlayerId,
      sourceCardId,
      catalogue,
    );
    return { state: next, pendingEffects: [] };
  }

  return disconnectUnit(next, matchUnitId, catalogue, targets, choices);
}

function batchDisconnectLethalUnits(
  state: MatchState,
  unitIds: readonly string[],
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
  choices?: RuntimeChoiceBindings,
): EngineResult {
  const records = [...new Set(unitIds)]
    .map((id) => findUnit(state, id))
    .filter((entry): entry is UnitLocation => Boolean(entry));
  let next = state;
  const cards = records.map((record) => ({
    record,
    card: getCard(catalogue, record.unit.definitionId),
  }));

  for (const { record, card } of cards) {
    const fresh = findUnit(next, record.unit.matchUnitId);
    if (!fresh) continue;
    next = destroyUnitWithoutTrigger(next, fresh);
    if (card.effects?.some((effect) => effect.trigger === "DISCONNECTION")) {
      next = incrementDisconnectionStat(next, record.unit.ownerPlayerId);
    }
  }

  const pending: PendingEffect[] = [];
  cards.sort((a, b) => {
    const aActive = a.record.unit.ownerPlayerId === state.activePlayerId ? 0 : 1;
    const bActive = b.record.unit.ownerPlayerId === state.activePlayerId ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.record.lane - b.record.lane;
  });

  for (const { record, card } of cards) {
    const own = resolveCardTrigger(next, card, "DISCONNECTION", catalogue, {
      sourcePlayerId: record.unit.ownerPlayerId,
      sourceUnitId: record.unit.matchUnitId,
      targets,
      choices,
    });
    next = own.state;
    pending.push(...own.pendingEffects);
    const passive = afterSet001Disconnection(
      next,
      record.unit.ownerPlayerId,
      record.unit.definitionId,
      catalogue,
      runtimeCallbacks(catalogue, {
        sourcePlayerId: record.unit.ownerPlayerId,
        sourceUnitId: record.unit.matchUnitId,
        targets,
        choices,
      }),
      targets,
      choices,
    );
    next = passive.state;
    pending.push(...runtimePendingToEngine(passive.pendingEffects));
  }

  return { state: next, pendingEffects: pending };
}

function consumeCostModifiers(
  state: MatchState,
  playerId: string,
  card: CardDefinition,
): MatchState {
  let next = state;
  if (
    card.type === "COMMAND" &&
    getPlayer(next, playerId).board.some((unit) => unit?.definitionId === "SET001-0033") &&
    getRuntimeCounter(next, playerId, "commandsCostReducedByR0") === 0
  ) {
    next = setRuntimeCounter(next, playerId, "commandsCostReducedByR0", 1);
  }

  const modifiers = getPlayerModifiers(next, playerId);
  for (const modifier of modifiers) {
    const applies =
      modifier.kind === "NEXT_ANY_COST" ||
      (modifier.kind === "NEXT_COMMAND_COST" && card.type === "COMMAND") ||
      (modifier.kind === "NEXT_CONTROOLZ_COST" && card.type === "CONTROOLZ") ||
      (modifier.kind === "CARD_COST" && modifier.data?.definitionId === card.id);
    if (!applies) continue;
    const uses = Number(modifier.data?.uses ?? 1);
    if (uses > 1) {
      next = removePlayerModifiers(next, playerId, (item) => item.id === modifier.id);
      next = addPlayerModifier(next, playerId, {
        kind: modifier.kind,
        amount: modifier.amount,
        expiresAtTurn: modifier.expiresAtTurn,
        sourceCardId: modifier.sourceCardId,
        data: { ...(modifier.data ?? {}), uses: uses - 1 },
      });
    } else {
      next = removePlayerModifiers(next, playerId, (item) => item.id === modifier.id);
    }
  }
  return next;
}

function payCardCost(
  state: MatchState,
  playerId: string,
  card: CardDefinition,
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
): MatchState {
  let cost = getSet001EffectiveCost(state, playerId, card, catalogue);
  const targetsAlly = Boolean(
    targets &&
      Object.values(targets)
        .flat()
        .some((id) => findUnit(state, id)?.unit.ownerPlayerId === playerId),
  );
  if (
    card.type === "COMMAND" &&
    targetsAlly &&
    getPlayer(state, playerId).board.some((unit) => unit?.definitionId === "SET001-0153") &&
    getRuntimeCounter(state, playerId, "protocol47Discount") === 0
  ) {
    cost = Math.max(1, cost - 1);
  }

  let next = spendEnergy(state, playerId, cost);
  next = consumeCostModifiers(next, playerId, card);
  if (
    card.type === "COMMAND" &&
    targetsAlly &&
    getPlayer(next, playerId).board.some((unit) => unit?.definitionId === "SET001-0153") &&
    getRuntimeCounter(next, playerId, "protocol47Discount") === 0
  ) {
    next = setRuntimeCounter(next, playerId, "protocol47Discount", 1);
  }
  next = afterSet001CardPaid(next, playerId, card);
  return next;
}

export interface PlayControolzInput {
  state: MatchState;
  playerId: string;
  definitionId: string;
  lane: LaneIndex;
  catalogue: readonly CardDefinition[];
  targets?: EffectTargetBindings;
  choices?: RuntimeChoiceBindings;
  rules?: GameRulesConfig;
}

export function playControolz(input: PlayControolzInput): EngineResult {
  const rules = input.rules ?? DEFAULT_GAME_RULES;
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "CONTROL");

  const card = getCard(input.catalogue, input.definitionId);
  if (card.type !== "CONTROOLZ") throw new Error("A carta escolhida não é um Controolz.");
  if (card.cost <= 0 || card.enabled === false) {
    throw new Error("Tokens/definições internas não podem ser jogados da mão.");
  }

  const player = getPlayer(input.state, input.playerId);
  if (player.board[input.lane]) throw new Error("A linha escolhida já está ocupada.");
  if (!player.hand.includes(card.id)) throw new Error("O Controolz não está na mão.");

  let next = payCardCost(
    input.state,
    input.playerId,
    card,
    input.catalogue,
    input.targets,
  );
  next = updatePlayer(next, input.playerId, (current) => {
    const withoutCard = removeOneFromHand(current, card.id);
    const board = [...withoutCard.board] as [UnitState | null, UnitState | null, UnitState | null];
    const matchUnitId = `${next.matchId}:${next.turn}:${input.playerId}:${card.collectorNumber}:${withoutCard.turnStats.cardsPlayed + 1}`;
    board[input.lane] = {
      matchUnitId,
      definitionId: card.id,
      ownerPlayerId: input.playerId,
      lane: input.lane,
      attack: card.attack,
      maxDefense: card.defense,
      currentDefense: card.defense,
      enteredOnTurn: next.turn,
      attacksUsedThisTurn: 0,
      canAttackOnDeploy: rules.deployedUnitsCanAttackByDefault,
    };
    return {
      ...withoutCard,
      board,
      turnStats: {
        ...withoutCard.turnStats,
        cardsPlayed: withoutCard.turnStats.cardsPlayed + 1,
      },
    };
  });

  const placed = getPlayer(next, input.playerId).board[input.lane];
  if (!placed) throw new Error("Falha interna ao conectar Controolz.");
  next = afterSet001UnitConnected(next, placed.matchUnitId, input.catalogue);
  next = afterSet001CardPlayed(next, input.playerId, card);

  return resolveCardTrigger(next, card, "CONNECTION", input.catalogue, {
    sourcePlayerId: input.playerId,
    sourceUnitId: placed.matchUnitId,
    targets: input.targets,
    choices: input.choices,
  });
}

export interface PlayCommandInput {
  state: MatchState;
  playerId: string;
  definitionId: string;
  catalogue: readonly CardDefinition[];
  targets?: EffectTargetBindings;
  choices?: RuntimeChoiceBindings;
}

function filteredCommandTargets(
  state: MatchState,
  playerId: string,
  targets: EffectTargetBindings | undefined,
): EffectTargetBindings | undefined {
  if (!targets) return targets;
  const next: Partial<Record<TargetSelector, readonly string[]>> = {};
  for (const [selector, ids] of Object.entries(targets) as [TargetSelector, readonly string[]][]) {
    next[selector] = ids.filter((id) => {
      const target = findUnit(state, id);
      if (!target) return true;
      return !isSet001CommandTargetProtected(state, playerId, target.unit);
    });
  }
  return next;
}

export function playCommand(input: PlayCommandInput): EngineResult {
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "CONTROL");
  const card = getCard(input.catalogue, input.definitionId);
  if (card.type !== "COMMAND") throw new Error("A carta escolhida não é um Comando.");

  const player = getPlayer(input.state, input.playerId);
  if (!player.hand.includes(card.id)) throw new Error("O Comando não está na mão.");

  if (
    input.targets &&
    Object.values(input.targets)
      .flat()
      .some((id) => {
        const target = findUnit(input.state, id);
        return (
          target?.unit.definitionId === "SET001-0192" &&
          target.unit.ownerPlayerId === input.playerId
        );
      })
  ) {
    throw new Error("Dinossauro de Camarim não pode ser alvo dos seus próprios Comandos.");
  }

  const allTargets = input.targets ? Object.values(input.targets).flat() : [];
  let next = prepareSet001CommandTargeting(
    input.state,
    input.playerId,
    allTargets,
    input.catalogue,
  );
  const effectiveTargets = filteredCommandTargets(next, input.playerId, input.targets);

  next = payCardCost(next, input.playerId, card, input.catalogue, input.targets);
  next = updatePlayer(next, input.playerId, (current) => {
    const withoutCard = removeOneFromHand(current, card.id);
    return {
      ...withoutCard,
      discard: [...withoutCard.discard, card.id],
      turnStats: {
        ...withoutCard.turnStats,
        cardsPlayed: withoutCard.turnStats.cardsPlayed + 1,
        commandsPlayed: withoutCard.turnStats.commandsPlayed + 1,
      },
    };
  });
  next = afterSet001CardPlayed(next, input.playerId, card);

  return resolveCardTrigger(next, card, "COMMAND_RESOLVE", input.catalogue, {
    sourcePlayerId: input.playerId,
    targets: effectiveTargets,
    choices: input.choices,
  });
}

export function beginCombat(state: MatchState, playerId: string): MatchState {
  assertActivePlayer(state, playerId);
  assertPhase(state, "CONTROL");
  return { ...state, phase: "COMBAT" };
}

export interface AttackLaneInput {
  state: MatchState;
  playerId: string;
  lane: LaneIndex;
  catalogue: readonly CardDefinition[];
  rules?: GameRulesConfig;
  targets?: EffectTargetBindings;
  choices?: RuntimeChoiceBindings;
}

function applyCombatDamageWithoutDisconnect(
  state: MatchState,
  unitId: string,
  amount: number,
  catalogue: readonly CardDefinition[],
): { state: MatchState; lethal: boolean; actualDamage: number } {
  const initial = findUnit(state, unitId);
  if (!initial || amount <= 0) return { state, lethal: false, actualDamage: 0 };
  const prepared = applySet001PreUnitDamage(state, unitId, amount, catalogue);
  let next = prepared.state;
  if (prepared.amount <= 0) return { state: next, lethal: false, actualDamage: 0 };
  const location = findUnit(next, unitId);
  if (!location) return { state: next, lethal: false, actualDamage: 0 };
  const nextDefense = location.unit.currentDefense - prepared.amount;
  next = replaceUnitAt(next, location.playerIndex, location.lane, {
    ...location.unit,
    currentDefense: nextDefense,
  });
  next = recordUnitDamage(next, location.unit.ownerPlayerId, prepared.amount);
  return { state: next, lethal: nextDefense <= 0, actualDamage: prepared.amount };
}

export function attackLane(input: AttackLaneInput): EngineResult {
  const rules = input.rules ?? DEFAULT_GAME_RULES;
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "COMBAT");

  const attackerIndex = getPlayerIndex(input.state, input.playerId);
  const defenderIndex = getOpponentIndex(input.state, input.playerId);
  const attacker = input.state.players[attackerIndex].board[input.lane];
  if (!attacker) throw new Error("Não existe Controolz nessa linha para atacar.");
  if (!canSet001UnitAttackAtAll(input.state, attacker, input.catalogue)) {
    throw new Error("Este Controolz não pode atacar.");
  }
  if (
    attacker.enteredOnTurn === input.state.turn &&
    !canSet001AttackOnDeploy(input.state, attacker)
  ) {
    throw new Error("Este Controolz acabou de entrar e ainda não pode atacar.");
  }
  const maxAttacks = getSet001MaxAttacksThisTurn(
    input.state,
    attacker,
    rules.maxAttacksPerUnitPerTurn,
  );
  if (attacker.attacksUsedThisTurn >= maxAttacks) {
    throw new Error("Este Controolz já usou todos os ataques permitidos no turno.");
  }

  const defenderPlayerId = input.state.players[defenderIndex].playerId;
  const taunt = getSet001TauntTarget(input.state, defenderPlayerId);
  const defender = taunt ?? input.state.players[defenderIndex].board[input.lane];
  if (!defender && !canSet001UnitAttackController(input.state, attacker, input.catalogue)) {
    throw new Error("Este Controolz não pode atacar o Controller inimigo agora.");
  }

  const attackerDamage = getSet001EffectiveAttack(
    input.state,
    attacker,
    input.catalogue,
    !defender,
  );
  const defenderDamage = defender
    ? getSet001EffectiveAttack(input.state, defender, input.catalogue, false)
    : 0;

  let next = replaceUnitAt(input.state, attackerIndex, input.lane, {
    ...attacker,
    attacksUsedThisTurn: attacker.attacksUsedThisTurn + 1,
  });
  next = updatePlayer(next, input.playerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      unitsAttacked: player.turnStats.unitsAttacked + 1,
    },
  }));

  const pending: PendingEffect[] = [];
  if (!hasUnitRuntimeFlag(next, attacker.matchUnitId, "NO_ON_ATTACK")) {
    const attackTrigger = resolveCardTrigger(
      next,
      getCard(input.catalogue, attacker.definitionId),
      "ON_ATTACK",
      input.catalogue,
      {
        sourcePlayerId: input.playerId,
        sourceUnitId: attacker.matchUnitId,
        targets: input.targets,
        choices: input.choices,
      },
    );
    next = attackTrigger.state;
    pending.push(...attackTrigger.pendingEffects);
  }

  if (!defender) {
    next = damageSignal(next, defenderPlayerId, input.playerId, attackerDamage);
    const afterAttack = afterSet001AttackResolved(
      next,
      attacker.matchUnitId,
      input.catalogue,
      runtimeCallbacks(input.catalogue, {
        sourcePlayerId: input.playerId,
        sourceUnitId: attacker.matchUnitId,
        targets: input.targets,
        choices: input.choices,
      }),
      input.targets,
      input.choices,
    );
    return {
      state: afterAttack.state,
      pendingEffects: [...pending, ...runtimePendingToEngine(afterAttack.pendingEffects)],
    };
  }

  const defenderHit = applyCombatDamageWithoutDisconnect(
    next,
    defender.matchUnitId,
    attackerDamage,
    input.catalogue,
  );
  next = defenderHit.state;
  const attackerHit = applyCombatDamageWithoutDisconnect(
    next,
    attacker.matchUnitId,
    defenderDamage,
    input.catalogue,
  );
  next = attackerHit.state;

  let defenderLethal = defenderHit.lethal;
  let attackerLethal = attackerHit.lethal;
  if (defenderLethal) {
    const replacement = beforeSet001UnitWouldDisconnectFromDamage(
      next,
      defender.matchUnitId,
      input.catalogue,
    );
    next = replacement.state;
    defenderLethal = !replacement.survives;
  }
  if (attackerLethal) {
    const replacement = beforeSet001UnitWouldDisconnectFromDamage(
      next,
      attacker.matchUnitId,
      input.catalogue,
    );
    next = replacement.state;
    attackerLethal = !replacement.survives;
  }

  if (!defenderLethal && findUnit(next, defender.matchUnitId)) {
    next = afterSet001UnitDamaged(
      next,
      defender.matchUnitId,
      input.playerId,
      attacker.definitionId,
      input.catalogue,
    );
  }
  if (!attackerLethal && findUnit(next, attacker.matchUnitId)) {
    next = afterSet001UnitDamaged(
      next,
      attacker.matchUnitId,
      defender.ownerPlayerId,
      defender.definitionId,
      input.catalogue,
    );
  }

  const lethalIds: string[] = [];
  if (defenderLethal) lethalIds.push(defender.matchUnitId);
  if (attackerLethal) lethalIds.push(attacker.matchUnitId);
  if (lethalIds.length) {
    const disconnected = batchDisconnectLethalUnits(
      next,
      lethalIds,
      input.catalogue,
      input.targets,
      input.choices,
    );
    next = disconnected.state;
    pending.push(...disconnected.pendingEffects);
  }

  const afterAttack = afterSet001AttackResolved(
    next,
    attacker.matchUnitId,
    input.catalogue,
    runtimeCallbacks(input.catalogue, {
      sourcePlayerId: input.playerId,
      sourceUnitId: attacker.matchUnitId,
      targets: input.targets,
      choices: input.choices,
    }),
    input.targets,
    input.choices,
  );
  next = afterAttack.state;
  pending.push(...runtimePendingToEngine(afterAttack.pendingEffects));

  return { state: next, pendingEffects: pending };
}

export function endTurn(
  state: MatchState,
  playerId: string,
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
  catalogue: readonly CardDefinition[] = [],
  targets?: EffectTargetBindings,
  choices?: RuntimeChoiceBindings,
): MatchState {
  assertActivePlayer(state, playerId);
  if (state.phase !== "CONTROL" && state.phase !== "COMBAT") {
    throw new Error("O turno só pode terminar após a fase de Controle ou Combate.");
  }
  if (state.outcome) return state;

  let next = state;
  if (catalogue.length) {
    const endDamage = resolveSet001EndTurnDamage(
      next,
      playerId,
      catalogue,
      runtimeCallbacks(catalogue, { sourcePlayerId: playerId, targets, choices }),
      targets,
      choices,
    );
    next = endDamage.state;
    if (next.outcome) return next;
  }

  const opponentId = getOpponent(next, playerId).playerId;
  const nextSequence = { ...next, turn: next.turn + 1, phase: "END" as const };
  next = preparePlayerTurn(nextSequence, opponentId, rules);
  if (catalogue.length) next = afterSet001TurnStart(next, opponentId, catalogue);
  return next;
}
