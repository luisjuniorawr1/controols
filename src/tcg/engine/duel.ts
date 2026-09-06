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

export type EffectTargetBindings = Partial<Record<TargetSelector, readonly string[]>>;

export interface PendingEffect {
  cardId: string;
  sourcePlayerId: string;
  sourceUnitId?: string;
  trigger: CardEffect["trigger"];
  text: string;
  reason:
    | "TARGET_REQUIRED"
    | "UNSTRUCTURED_EFFECT"
    | "UNSUPPORTED_TEMPORARY_MODIFIER"
    | "UNSUPPORTED_ACTION";
  requiredTarget?: TargetSelector;
}

export interface EngineResult {
  state: MatchState;
  pendingEffects: readonly PendingEffect[];
}

export interface EffectContext {
  sourcePlayerId: string;
  sourceUnitId?: string;
  targets?: EffectTargetBindings;
}

function catalogueMap(catalogue: readonly CardDefinition[]): Map<string, CardDefinition> {
  return new Map(catalogue.map((card) => [card.id, card] as const));
}

function getCard(
  catalogue: readonly CardDefinition[],
  definitionId: string,
): CardDefinition {
  const card = catalogueMap(catalogue).get(definitionId);
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

function removeOneFromHand(player: PlayerMatchState, definitionId: string): PlayerMatchState {
  const index = player.hand.indexOf(definitionId);
  if (index < 0) throw new Error(`A carta ${definitionId} não está na mão.`);
  return {
    ...player,
    hand: [...player.hand.slice(0, index), ...player.hand.slice(index + 1)],
  };
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
          if (selector === "ALLY_CONTROOLZ" || selector === "RANDOM_ALLY_CONTROOLZ") {
            return entry.playerIndex === sourceIndex;
          }
          if (selector === "OTHER_ALLY_CONTROOLZ") {
            return (
              entry.playerIndex === sourceIndex &&
              entry.unit.matchUnitId !== context.sourceUnitId
            );
          }
          if (selector === "ENEMY_CONTROOLZ" || selector === "RANDOM_ENEMY_CONTROOLZ") {
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

function addToDiscard(state: MatchState, ownerPlayerId: string, definitionId: string): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    discard: [...player.discard, definitionId],
  }));
}

function addToHand(state: MatchState, ownerPlayerId: string, definitionId: string): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    hand: [...player.hand, definitionId],
  }));
}

function incrementDestroyedStat(state: MatchState, ownerPlayerId: string): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      unitsDestroyed: player.turnStats.unitsDestroyed + 1,
    },
  }));
}

function incrementDisconnectionStat(state: MatchState, ownerPlayerId: string): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      disconnectionsTriggered: player.turnStats.disconnectionsTriggered + 1,
    },
  }));
}

function recordUnitDamage(state: MatchState, ownerPlayerId: string, amount: number): MatchState {
  return updatePlayer(state, ownerPlayerId, (player) => ({
    ...player,
    turnStats: {
      ...player.turnStats,
      damageTaken: player.turnStats.damageTaken + amount,
    },
  }));
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
  return replaceUnitAt(state, fresh.playerIndex, fresh.lane, {
    ...fresh.unit,
    attack: Math.max(0, fresh.unit.attack + attackDelta),
    maxDefense: nextMaxDefense,
    currentDefense: nextCurrentDefense,
  });
}

function restoreUnitDefense(
  state: MatchState,
  target: UnitLocation,
  amount: number,
): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return state;
  return replaceUnitAt(state, fresh.playerIndex, fresh.lane, {
    ...fresh.unit,
    currentDefense: Math.min(
      fresh.unit.maxDefense,
      fresh.unit.currentDefense + Math.max(0, amount),
    ),
  });
}

function returnUnitToHand(state: MatchState, target: UnitLocation): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return state;
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, null);
  next = addToHand(next, fresh.unit.ownerPlayerId, fresh.unit.definitionId);
  return next;
}

function destroyUnitWithoutTrigger(state: MatchState, target: UnitLocation): MatchState {
  const fresh = findUnit(state, target.unit.matchUnitId);
  if (!fresh) return state;
  let next = replaceUnitAt(state, fresh.playerIndex, fresh.lane, null);
  next = addToDiscard(next, fresh.unit.ownerPlayerId, fresh.unit.definitionId);
  return incrementDestroyedStat(next, fresh.unit.ownerPlayerId);
}

export function resolveCardTrigger(
  state: MatchState,
  card: CardDefinition,
  trigger: CardEffect["trigger"],
  catalogue: readonly CardDefinition[],
  context: EffectContext,
): EngineResult {
  const effects = card.effects?.filter((effect) => effect.trigger === trigger) ?? [];
  let next = state;
  const pending: PendingEffect[] = [];

  for (const effect of effects) {
    if (!effect.actions?.length) {
      pending.push({
        cardId: card.id,
        sourcePlayerId: context.sourcePlayerId,
        sourceUnitId: context.sourceUnitId,
        trigger,
        text: effect.text,
        reason: "UNSTRUCTURED_EFFECT",
      });
      continue;
    }

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
      const applied = applyEffectAction(next, action, catalogue, context);
      next = applied.state;
      pending.push(...applied.pendingEffects);
    }
  }

  return { state: next, pendingEffects: pending };
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

function applyEffectAction(
  state: MatchState,
  action: EffectAction,
  catalogue: readonly CardDefinition[],
  context: EffectContext,
): EngineResult {
  let next = state;
  const pending: PendingEffect[] = [];
  const ownerPlayerId = context.sourcePlayerId;
  const opponentPlayerId = getOpponent(state, ownerPlayerId).playerId;

  if (action.type === "CHANGE_SIGNAL") {
    const playerId = action.player === "SELF" ? ownerPlayerId : opponentPlayerId;
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
    const playerId = (action.player ?? "SELF") === "SELF" ? ownerPlayerId : opponentPlayerId;
    return { state: drawCards(next, playerId, action.amount), pendingEffects: [] };
  }

  if (action.type === "DISCARD_RANDOM") {
    pending.push({
      cardId: "RUNTIME",
      sourcePlayerId: ownerPlayerId,
      sourceUnitId: context.sourceUnitId,
      trigger: "PASSIVE",
      text: "Descarte aleatório exige RNG determinístico do servidor.",
      reason: "UNSUPPORTED_ACTION",
    });
    return { state: next, pendingEffects: pending };
  }

  const selector = actionTarget(action);
  if (!selector) {
    pending.push({
      cardId: "RUNTIME",
      sourcePlayerId: ownerPlayerId,
      sourceUnitId: context.sourceUnitId,
      trigger: "PASSIVE",
      text: "Ação de efeito ainda não suportada pelo runtime.",
      reason: "UNSUPPORTED_ACTION",
    });
    return { state: next, pendingEffects: pending };
  }

  const targets = resolveUnitTargets(next, selector, context);
  if (targetNeedsExplicitBinding(selector) && targets.length === 0) {
    return {
      state: next,
      pendingEffects: [invalidResolvedTargetPending(context, selector)],
    };
  }

  if (action.type === "RESTORE_DEFENSE") {
    for (const target of targets) next = restoreUnitDefense(next, target, action.amount);
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "MODIFY_ATTACK" || action.type === "MODIFY_DEFENSE") {
    if (action.duration === "TURN") {
      pending.push({
        cardId: "RUNTIME",
        sourcePlayerId: ownerPlayerId,
        sourceUnitId: context.sourceUnitId,
        trigger: "PASSIVE",
        text: "Modificador temporário ainda precisa do sistema de duração.",
        reason: "UNSUPPORTED_TEMPORARY_MODIFIER",
      });
      return { state: next, pendingEffects: pending };
    }
    for (const target of targets) {
      next = modifyUnitPermanent(
        next,
        target,
        action.type === "MODIFY_ATTACK" ? action.amount : 0,
        action.type === "MODIFY_DEFENSE" ? action.amount : 0,
      );
    }
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "RETURN_TO_HAND") {
    for (const target of targets) next = returnUnitToHand(next, target);
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "DESTROY") {
    for (const target of targets) {
      const result = disconnectUnit(next, target.unit.matchUnitId, catalogue, context.targets);
      next = result.state;
      pending.push(...result.pendingEffects);
    }
    return { state: next, pendingEffects: pending };
  }

  if (action.type === "DEAL_DAMAGE") {
    for (const target of targets) {
      const result = damageUnit(next, target.unit.matchUnitId, action.amount, catalogue, context.targets);
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
): EngineResult {
  const location = findUnit(state, matchUnitId);
  if (!location) return { state, pendingEffects: [] };
  const card = getCard(catalogue, location.unit.definitionId);
  const hasDisconnection = Boolean(
    card.effects?.some((effect) => effect.trigger === "DISCONNECTION"),
  );

  let next = destroyUnitWithoutTrigger(state, location);
  if (hasDisconnection) next = incrementDisconnectionStat(next, location.unit.ownerPlayerId);

  return resolveCardTrigger(next, card, "DISCONNECTION", catalogue, {
    sourcePlayerId: location.unit.ownerPlayerId,
    sourceUnitId: matchUnitId,
    targets,
  });
}

export function damageUnit(
  state: MatchState,
  matchUnitId: string,
  amount: number,
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
): EngineResult {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Quantidade de dano inválida.");
  }
  const location = findUnit(state, matchUnitId);
  if (!location || amount === 0) return { state, pendingEffects: [] };

  const nextDefense = location.unit.currentDefense - amount;
  let next = replaceUnitAt(state, location.playerIndex, location.lane, {
    ...location.unit,
    currentDefense: nextDefense,
  });
  next = recordUnitDamage(next, location.unit.ownerPlayerId, amount);

  if (nextDefense > 0) return { state: next, pendingEffects: [] };
  return disconnectUnit(next, matchUnitId, catalogue, targets);
}

interface QueuedDisconnection {
  card: CardDefinition;
  ownerPlayerId: string;
  matchUnitId: string;
}

function removeSimultaneouslyDestroyedUnits(
  state: MatchState,
  unitIdsInResolutionOrder: readonly string[],
  catalogue: readonly CardDefinition[],
  targets?: EffectTargetBindings,
): EngineResult {
  let next = state;
  const queue: QueuedDisconnection[] = [];
  const pending: PendingEffect[] = [];

  // First remove every unit that was already dead from simultaneous damage.
  // Only after that do DESCONEXÕES resolve, so one death trigger cannot rescue
  // another unit that was already lethally damaged in the same combat event.
  for (const unitId of unitIdsInResolutionOrder) {
    const location = findUnit(next, unitId);
    if (!location || location.unit.currentDefense > 0) continue;
    const card = getCard(catalogue, location.unit.definitionId);
    const hasDisconnection = Boolean(
      card.effects?.some((effect) => effect.trigger === "DISCONNECTION"),
    );
    next = destroyUnitWithoutTrigger(next, location);
    if (hasDisconnection) {
      next = incrementDisconnectionStat(next, location.unit.ownerPlayerId);
      queue.push({
        card,
        ownerPlayerId: location.unit.ownerPlayerId,
        matchUnitId: location.unit.matchUnitId,
      });
    }
  }

  // Provisional deterministic order: active player's destroyed unit first,
  // then the opponent's. This can be promoted to a formal APNAP rule later.
  for (const item of queue) {
    const result = resolveCardTrigger(next, item.card, "DISCONNECTION", catalogue, {
      sourcePlayerId: item.ownerPlayerId,
      sourceUnitId: item.matchUnitId,
      targets,
    });
    next = result.state;
    pending.push(...result.pendingEffects);
  }

  return { state: next, pendingEffects: pending };
}

export interface PlayControolzInput {
  state: MatchState;
  playerId: string;
  definitionId: string;
  lane: LaneIndex;
  catalogue: readonly CardDefinition[];
  targets?: EffectTargetBindings;
  rules?: GameRulesConfig;
}

export function playControolz(input: PlayControolzInput): EngineResult {
  const rules = input.rules ?? DEFAULT_GAME_RULES;
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "CONTROL");

  const card = getCard(input.catalogue, input.definitionId);
  if (card.type !== "CONTROOLZ") throw new Error("A carta escolhida não é um Controolz.");

  const player = getPlayer(input.state, input.playerId);
  if (player.board[input.lane]) throw new Error("A linha escolhida já está ocupada.");
  if (!player.hand.includes(card.id)) throw new Error("O Controolz não está na mão.");

  let next = spendEnergy(input.state, input.playerId, card.cost);
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

  return resolveCardTrigger(next, card, "CONNECTION", input.catalogue, {
    sourcePlayerId: input.playerId,
    sourceUnitId: placed.matchUnitId,
    targets: input.targets,
  });
}

export interface PlayCommandInput {
  state: MatchState;
  playerId: string;
  definitionId: string;
  catalogue: readonly CardDefinition[];
  targets?: EffectTargetBindings;
}

export function playCommand(input: PlayCommandInput): EngineResult {
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "CONTROL");
  const card = getCard(input.catalogue, input.definitionId);
  if (card.type !== "COMMAND") throw new Error("A carta escolhida não é um Comando.");

  const player = getPlayer(input.state, input.playerId);
  if (!player.hand.includes(card.id)) throw new Error("O Comando não está na mão.");

  let next = spendEnergy(input.state, input.playerId, card.cost);
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

  return resolveCardTrigger(next, card, "COMMAND_RESOLVE", input.catalogue, {
    sourcePlayerId: input.playerId,
    targets: input.targets,
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
}

export function attackLane(input: AttackLaneInput): EngineResult {
  const rules = input.rules ?? DEFAULT_GAME_RULES;
  assertActivePlayer(input.state, input.playerId);
  assertPhase(input.state, "COMBAT");

  const attackerIndex = getPlayerIndex(input.state, input.playerId);
  const defenderIndex = getOpponentIndex(input.state, input.playerId);
  const attacker = input.state.players[attackerIndex].board[input.lane];
  if (!attacker) throw new Error("Não existe Controolz nessa linha para atacar.");
  if (
    attacker.enteredOnTurn === input.state.turn &&
    !attacker.canAttackOnDeploy
  ) {
    throw new Error("Este Controolz acabou de entrar e ainda não pode atacar.");
  }
  if (attacker.attacksUsedThisTurn >= rules.maxAttacksPerUnitPerTurn) {
    throw new Error("Este Controolz já usou todos os ataques permitidos no turno.");
  }

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
  const attackerCard = getCard(input.catalogue, attacker.definitionId);
  const attackTrigger = resolveCardTrigger(next, attackerCard, "ON_ATTACK", input.catalogue, {
    sourcePlayerId: input.playerId,
    sourceUnitId: attacker.matchUnitId,
    targets: input.targets,
  });
  next = attackTrigger.state;
  pending.push(...attackTrigger.pendingEffects);

  const currentAttacker = findUnit(next, attacker.matchUnitId);
  if (!currentAttacker) {
    return { state: next, pendingEffects: pending };
  }

  const currentDefender = next.players[defenderIndex].board[input.lane];
  if (!currentDefender) {
    next = changeSignal(
      next,
      next.players[defenderIndex].playerId,
      -currentAttacker.unit.attack,
    );
    return { state: next, pendingEffects: pending };
  }

  const attackerDamage = currentAttacker.unit.attack;
  const defenderDamage = currentDefender.attack;
  const attackerUnitId = currentAttacker.unit.matchUnitId;
  const defenderUnitId = currentDefender.matchUnitId;

  // Mark both damage packets before resolving any destruction or DESCONEXÃO.
  const attackerAfterMark = findUnit(next, attackerUnitId);
  const defenderAfterMark = findUnit(next, defenderUnitId);
  if (!attackerAfterMark || !defenderAfterMark) {
    return { state: next, pendingEffects: pending };
  }

  next = replaceUnitAt(next, defenderAfterMark.playerIndex, defenderAfterMark.lane, {
    ...defenderAfterMark.unit,
    currentDefense: defenderAfterMark.unit.currentDefense - attackerDamage,
  });
  next = recordUnitDamage(next, defenderAfterMark.unit.ownerPlayerId, attackerDamage);

  const attackerStillMarked = findUnit(next, attackerUnitId);
  if (attackerStillMarked) {
    next = replaceUnitAt(next, attackerStillMarked.playerIndex, attackerStillMarked.lane, {
      ...attackerStillMarked.unit,
      currentDefense: attackerStillMarked.unit.currentDefense - defenderDamage,
    });
    next = recordUnitDamage(next, attackerStillMarked.unit.ownerPlayerId, defenderDamage);
  }

  const disconnections = removeSimultaneouslyDestroyedUnits(
    next,
    [attackerUnitId, defenderUnitId],
    input.catalogue,
    input.targets,
  );
  next = disconnections.state;
  pending.push(...disconnections.pendingEffects);

  return { state: next, pendingEffects: pending };
}

export function endTurn(
  state: MatchState,
  playerId: string,
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
): MatchState {
  assertActivePlayer(state, playerId);
  if (state.phase !== "CONTROL" && state.phase !== "COMBAT") {
    throw new Error("O turno só pode terminar após a fase de Controle ou Combate.");
  }
  if (state.outcome) return state;

  const opponentId = getOpponent(state, playerId).playerId;
  const nextSequence = { ...state, turn: state.turn + 1, phase: "END" as const };
  return preparePlayerTurn(nextSequence, opponentId, rules);
}
