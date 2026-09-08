import type {
  CardDefinition,
  LaneIndex,
  MatchState,
  RuntimeModifier,
  UnitState,
} from "../domain";
import { getSet001TokenDefinition } from "../cards/set001/tokens";
import { changeSignal, drawCards, getOpponent, getPlayer, getPlayerIndex, replacePlayer, updatePlayer } from "./match";
import {
  addPlayerModifier,
  addUnitModifier,
  getPlayerModifiers,
  getRuntimeCounter,
  getUnitModifiers,
  incrementRuntimeCounter,
  removePlayerModifiers,
  removeUnitModifiers,
  setRuntimeCounter,
} from "./runtime-state";
import {
  SET001_RUNTIME_INTERNALS,
  getSet001EffectiveAttack as getBaseAttack,
  getSet001EffectiveDefense as getBaseDefense,
  type RuntimeChoiceBindings,
  type RuntimeTargetBindings,
  type Set001RuntimeCallbacks,
  type Set001RuntimePending,
} from "./set001-runtime";

interface UnitLocation {
  playerIndex: 0 | 1;
  lane: LaneIndex;
  unit: UnitState;
}

export interface Set001EventResult {
  state: MatchState;
  pendingEffects: readonly Set001RuntimePending[];
}

function cardById(catalogue: readonly CardDefinition[], id: string): CardDefinition {
  const card = catalogue.find((item) => item.id === id) ?? getSet001TokenDefinition(id);
  if (!card) throw new Error(`Carta desconhecida no evento SET001: ${id}`);
  return card;
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

function replaceUnit(state: MatchState, location: UnitLocation, unit: UnitState): MatchState {
  const player = state.players[location.playerIndex];
  const board = [...player.board] as [UnitState | null, UnitState | null, UnitState | null];
  board[location.lane] = unit;
  return replacePlayer(state, location.playerIndex, { ...player, board });
}

function firstActiveModifier(
  modifiers: readonly RuntimeModifier[],
  kind: string,
  turn: number,
): RuntimeModifier | undefined {
  return modifiers.find(
    (modifier) =>
      modifier.kind === kind &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= turn),
  );
}

function usePoolModifier(
  state: MatchState,
  scope: "UNIT" | "PLAYER",
  scopeId: string,
  kind: string,
  amount: number,
): { state: MatchState; prevented: number } {
  const modifiers = scope === "UNIT" ? getUnitModifiers(state, scopeId) : getPlayerModifiers(state, scopeId);
  const modifier = firstActiveModifier(modifiers, kind, state.turn);
  if (!modifier || (modifier.amount ?? 0) <= 0 || amount <= 0) return { state, prevented: 0 };
  const prevented = Math.min(amount, modifier.amount ?? 0);
  const nextAmount = (modifier.amount ?? 0) - prevented;
  const rewrite = (current: RuntimeModifier): RuntimeModifier =>
    current.id === modifier.id ? { ...current, amount: nextAmount } : current;
  if (scope === "UNIT") {
    const runtime = state.runtime;
    if (!runtime) return { state, prevented: 0 };
    return {
      state: {
        ...state,
        runtime: {
          ...runtime,
          unitModifiers: {
            ...runtime.unitModifiers,
            [scopeId]: (runtime.unitModifiers[scopeId] ?? []).map(rewrite),
          },
        },
      },
      prevented,
    };
  }
  const runtime = state.runtime;
  if (!runtime) return { state, prevented: 0 };
  return {
    state: {
      ...state,
      runtime: {
        ...runtime,
        playerModifiers: {
          ...runtime.playerModifiers,
          [scopeId]: (runtime.playerModifiers[scopeId] ?? []).map(rewrite),
        },
      },
    },
    prevented,
  };
}

function temporaryDefenseAmount(state: MatchState, unitId: string): number {
  return getUnitModifiers(state, unitId)
    .filter(
      (modifier) =>
        modifier.kind === "TEMP_DEFENSE" &&
        (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
    )
    .reduce((sum, modifier) => sum + (modifier.amount ?? 0), 0);
}

/**
 * Positive temporary DEF is an absorbable shield. Damage consumes this shield
 * before permanent/current DEF, so temporary buffs do not permanently heal.
 */
export function consumeTemporaryDefense(
  state: MatchState,
  unitId: string,
  amount: number,
): { state: MatchState; remainingDamage: number } {
  if (amount <= 0) return { state, remainingDamage: 0 };
  const runtime = state.runtime;
  if (!runtime) return { state, remainingDamage: amount };
  let remaining = amount;
  const modifiers = [...(runtime.unitModifiers[unitId] ?? [])];
  const nextModifiers = modifiers.map((modifier) => {
    if (
      remaining <= 0 ||
      modifier.kind !== "TEMP_DEFENSE" ||
      (modifier.expiresAtTurn !== undefined && modifier.expiresAtTurn < state.turn) ||
      (modifier.amount ?? 0) <= 0
    ) {
      return modifier;
    }
    const absorb = Math.min(remaining, modifier.amount ?? 0);
    remaining -= absorb;
    return { ...modifier, amount: (modifier.amount ?? 0) - absorb };
  });
  return {
    state: {
      ...state,
      runtime: {
        ...runtime,
        unitModifiers: { ...runtime.unitModifiers, [unitId]: nextModifiers },
      },
    },
    remainingDamage: remaining,
  };
}

export function applySet001PreUnitDamage(
  state: MatchState,
  targetUnitId: string,
  amount: number,
  catalogue: readonly CardDefinition[],
): { state: MatchState; amount: number } {
  let next = state;
  let remaining = Math.max(0, amount);
  const target = findUnit(next, targetUnitId);
  if (!target || remaining <= 0) return { state: next, amount: remaining };

  const directShield = usePoolModifier(next, "UNIT", targetUnitId, "PREVENT_NEXT_DAMAGE", remaining);
  next = directShield.state;
  remaining -= directShield.prevented;

  const ownerId = target.unit.ownerPlayerId;
  const playerPool = usePoolModifier(next, "PLAYER", ownerId, "UNIT_DAMAGE_PREVENTION_POOL", remaining);
  next = playerPool.state;
  remaining -= playerPool.prevented;

  if (remaining <= 0) return { state: next, amount: 0 };

  // Nara Muralha: first damage to another ally each turn -1.
  const nara = getPlayer(next, ownerId).board.find(
    (unit) => unit?.definitionId === "SET001-0152" && unit.matchUnitId !== targetUnitId,
  );
  if (nara && getRuntimeCounter(next, ownerId, `naraMuralha:${nara.matchUnitId}`) === 0) {
    remaining = Math.max(0, remaining - 1);
    next = setRuntimeCounter(next, ownerId, `naraMuralha:${nara.matchUnitId}`, 1);
  }

  // Mamute de Musgo: first damage to each other allied Controolz each turn -1.
  const mamute = getPlayer(next, ownerId).board.find(
    (unit) => unit?.definitionId === "SET001-0078" && unit.matchUnitId !== targetUnitId,
  );
  if (mamute && getRuntimeCounter(next, ownerId, `mamute:${targetUnitId}`) === 0) {
    remaining = Math.max(0, remaining - 1);
    next = setRuntimeCounter(next, ownerId, `mamute:${targetUnitId}`, 1);
  }

  // Muralha Ambulante: first damage it suffers each turn -2.
  if (
    target.unit.definitionId === "SET001-0165" &&
    getRuntimeCounter(next, ownerId, `muralhaAmbulante:${targetUnitId}`) === 0
  ) {
    remaining = Math.max(0, remaining - 2);
    next = setRuntimeCounter(next, ownerId, `muralhaAmbulante:${targetUnitId}`, 1);
  }

  const temp = consumeTemporaryDefense(next, targetUnitId, remaining);
  next = temp.state;
  remaining = temp.remainingDamage;

  return { state: next, amount: remaining };
}

export function applySet001PreSignalDamage(
  state: MatchState,
  targetPlayerId: string,
  sourcePlayerId: string,
  amount: number,
): { state: MatchState; amount: number } {
  let next = state;
  let remaining = Math.max(0, amount);
  if (remaining <= 0) return { state: next, amount: 0 };

  if (
    getPlayerModifiers(next, sourcePlayerId).some(
      (modifier) =>
        modifier.kind === "CANNOT_DAMAGE_ENEMY_SIGNAL" &&
        (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= next.turn),
    )
  ) {
    return { state: next, amount: 0 };
  }

  if (
    getPlayerModifiers(next, targetPlayerId).some(
      (modifier) =>
        modifier.kind === "PREVENT_ALL_SIGNAL_DAMAGE" &&
        (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= next.turn),
    )
  ) {
    return { state: next, amount: 0 };
  }

  const pool = usePoolModifier(next, "PLAYER", targetPlayerId, "PREVENT_SIGNAL_DAMAGE_POOL", remaining);
  next = pool.state;
  remaining -= pool.prevented;
  return { state: next, amount: remaining };
}

export function recordSet001SignalDamage(
  state: MatchState,
  playerId: string,
  amount: number,
): MatchState {
  if (amount <= 0) return state;
  let next = incrementRuntimeCounter(state, playerId, "signalDamageThisTurn", amount);
  next = incrementRuntimeCounter(next, playerId, "signalDamageSinceOwnTurn", amount);
  return next;
}

function addTempAttack(
  state: MatchState,
  unitId: string,
  amount: number,
  expiresAtTurn: number,
  sourceCardId: string,
): MatchState {
  return SET001_RUNTIME_INTERNALS.addTemporaryStat(
    state,
    unitId,
    "TEMP_ATTACK",
    amount,
    expiresAtTurn,
    sourceCardId,
  );
}

function applyPermanent(
  state: MatchState,
  unitId: string,
  attack: number,
  defense: number,
): MatchState {
  return SET001_RUNTIME_INTERNALS.modifyPermanent(state, unitId, attack, defense);
}

export function afterSet001UnitDamaged(
  state: MatchState,
  targetUnitId: string,
  sourcePlayerId: string | undefined,
  sourceCardId: string | undefined,
  catalogue: readonly CardDefinition[],
): MatchState {
  let next = state;
  const location = findUnit(next, targetUnitId);
  if (!location || location.unit.currentDefense <= 0) return next;
  const ownerId = location.unit.ownerPlayerId;
  const cardId = location.unit.definitionId;

  if (
    cardId === "SET001-0002" &&
    getRuntimeCounter(next, ownerId, `chassiQuente:${targetUnitId}`) === 0
  ) {
    next = addTempAttack(next, targetUnitId, 1, next.turn, cardId);
    next = setRuntimeCounter(next, ownerId, `chassiQuente:${targetUnitId}`, 1);
  }
  if (
    cardId === "SET001-0014" &&
    getRuntimeCounter(next, ownerId, `cromo:${targetUnitId}`) === 0
  ) {
    next = applyPermanent(next, targetUnitId, 1, 0);
    next = setRuntimeCounter(next, ownerId, `cromo:${targetUnitId}`, 1);
  }

  // Mara-13 Bandeira Rubra rewards self-inflicted allied damage, max twice/turn.
  if (sourcePlayerId === ownerId && sourceCardId) {
    const mara = getPlayer(next, ownerId).board.find(
      (unit) =>
        unit?.definitionId === "SET001-0021" && unit.matchUnitId !== targetUnitId,
    );
    if (mara) {
      const key = `maraRubra:${mara.matchUnitId}`;
      const used = getRuntimeCounter(next, ownerId, key);
      if (used < 2) {
        next = changeSignal(next, getOpponent(next, ownerId).playerId, -1);
        next = setRuntimeCounter(next, ownerId, key, used + 1);
      }
    }
  }

  void catalogue;
  return next;
}

export function afterSet001DefenseRecovered(
  state: MatchState,
  targetUnitId: string,
  amountRecovered: number,
  catalogue: readonly CardDefinition[],
): MatchState {
  if (amountRecovered <= 0) return state;
  let next = state;
  const target = findUnit(next, targetUnitId);
  if (!target) return next;
  const ownerId = target.unit.ownerPlayerId;

  if (
    target.unit.definitionId === "SET001-0062" &&
    getRuntimeCounter(next, ownerId, `teco:${targetUnitId}`) === 0
  ) {
    next = addTempAttack(next, targetUnitId, 1, next.turn, "SET001-0062");
    next = setRuntimeCounter(next, ownerId, `teco:${targetUnitId}`, 1);
  }
  if (
    target.unit.definitionId === "SET001-0067" &&
    getRuntimeCounter(next, ownerId, `denteCasca:${targetUnitId}`) === 0
  ) {
    next = applyPermanent(next, targetUnitId, 1, 1);
    next = setRuntimeCounter(next, ownerId, `denteCasca:${targetUnitId}`, 1);
  }

  for (const ally of getPlayer(next, ownerId).board) {
    if (!ally || ally.matchUnitId === targetUnitId) continue;
    if (ally.definitionId === "SET001-0072") {
      const key = `tucaRaiz:${ally.matchUnitId}`;
      const count = getRuntimeCounter(next, ownerId, key);
      if (count < 2) {
        next = addTempAttack(next, ally.matchUnitId, 1, next.turn, "SET001-0072");
        next = setRuntimeCounter(next, ownerId, key, count + 1);
      }
    }
    if (ally.definitionId === "SET001-0079") {
      const key = `zairaPulso:${ally.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = drawCards(next, ownerId, 1);
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
  }

  void catalogue;
  return next;
}

export function afterSet001UnitConnected(
  state: MatchState,
  connectedUnitId: string,
  catalogue: readonly CardDefinition[],
): MatchState {
  let next = state;
  const connected = findUnit(next, connectedUnitId);
  if (!connected) return next;
  const ownerId = connected.unit.ownerPlayerId;

  // WILD growth when another ally connects.
  for (const ally of getPlayer(next, ownerId).board) {
    if (!ally || ally.matchUnitId === connectedUnitId) continue;
    if (ally.definitionId === "SET001-0065") {
      const key = `vinha6:${ally.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = applyPermanent(next, ally.matchUnitId, 0, 1);
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
    if (ally.definitionId === "SET001-0075") {
      const key = `zairaJovem:${ally.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = applyPermanent(next, connectedUnitId, 0, 1);
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
  }

  // Xadrez Quebrado weakens enemy units as they connect.
  const opponentId = getOpponent(next, ownerId).playerId;
  const enemyHasXadrez = getPlayer(next, opponentId).board.some(
    (unit) => unit?.definitionId === "SET001-0103",
  );
  if (enemyHasXadrez) {
    next = addTempAttack(next, connectedUnitId, -1, next.turn, "SET001-0103");
  }

  void catalogue;
  return next;
}

export function afterSet001CardPlayed(
  state: MatchState,
  playerId: string,
  card: CardDefinition,
): MatchState {
  let next = state;
  const cardsPlayed = getRuntimeCounter(next, playerId, "cardsPlayed");

  for (const unit of getPlayer(next, playerId).board) {
    if (!unit) continue;
    if (
      card.type === "COMMAND" &&
      unit.definitionId === "SET001-0037" &&
      getRuntimeCounter(next, playerId, `profParen:${unit.matchUnitId}`) === 0
    ) {
      next = applyPermanent(next, unit.matchUnitId, 0, 1);
      next = setRuntimeCounter(next, playerId, `profParen:${unit.matchUnitId}`, 1);
    }
    if (unit.definitionId === "SET001-0042" && cardsPlayed === 2) {
      next = addTempAttack(next, unit.matchUnitId, 1, next.turn + 2, "SET001-0042");
      next = addUnitModifier(next, unit.matchUnitId, {
        kind: "TEMP_DEFENSE",
        amount: 1,
        expiresAtTurn: next.turn + 2,
        sourceCardId: "SET001-0042",
      });
    }
    if (unit.definitionId === "SET001-0050" && cardsPlayed === 2) {
      const opponentId = getOpponent(next, playerId).playerId;
      next = addPlayerModifier(next, opponentId, {
        kind: "NEXT_COMMAND_COST",
        amount: 1,
        expiresAtTurn: next.turn + 2,
        sourceCardId: "SET001-0050",
      });
    }
  }

  return next;
}

function selectedEnemyTarget(
  state: MatchState,
  ownerId: string,
  targets?: RuntimeTargetBindings,
): string | null {
  const id = targets?.ENEMY_CONTROOLZ?.[0];
  if (!id) return null;
  const found = findUnit(state, id);
  if (!found || found.playerIndex === getPlayerIndex(state, ownerId)) return null;
  return id;
}

export function afterSet001Disconnection(
  state: MatchState,
  ownerId: string,
  disconnectedDefinitionId: string,
  catalogue: readonly CardDefinition[],
  callbacks: Set001RuntimeCallbacks,
  targets?: RuntimeTargetBindings,
  choices?: RuntimeChoiceBindings,
): Set001EventResult {
  let next = state;
  const pendingEffects: Set001RuntimePending[] = [];

  for (const unit of getPlayer(next, ownerId).board) {
    if (!unit) continue;
    if (unit.definitionId === "SET001-0124") {
      const key = `coletor8:${unit.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = addTempAttack(next, unit.matchUnitId, 2, next.turn, "SET001-0124");
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
    if (unit.definitionId === "SET001-0130") {
      const key = `vanta:${unit.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = changeSignal(next, getOpponent(next, ownerId).playerId, -1);
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
    if (unit.definitionId === "SET001-0135") {
      const key = `catedral:${unit.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        const mode = choices?.modes?.catedralTarget;
        if (mode === "CONTROLLER") {
          next = changeSignal(next, getOpponent(next, ownerId).playerId, -1);
          next = setRuntimeCounter(next, ownerId, key, 1);
        } else {
          const targetId = selectedEnemyTarget(next, ownerId, targets);
          if (!targetId) {
            pendingEffects.push({
              cardId: "SET001-0135",
              sourcePlayerId: ownerId,
              sourceUnitId: unit.matchUnitId,
              trigger: "PASSIVE",
              text: "Na primeira vez em que outro aliado ativar DESCONEXÃO a cada turno, cause 1 de dano a um alvo inimigo.",
              reason: "DECISION_REQUIRED",
              decisionKey: "catedralTarget",
            });
          } else {
            const result = callbacks.damageUnit(next, targetId, 1, targets, choices);
            next = result.state;
            pendingEffects.push(...result.pendingEffects);
            next = setRuntimeCounter(next, ownerId, key, 1);
          }
        }
      }
    }
    if (unit.definitionId === "SET001-0137") {
      const key = `iriaFim:${unit.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        const chosen = choices?.cards?.iriaReturn?.[0];
        if (!chosen) {
          pendingEffects.push({
            cardId: "SET001-0137",
            sourcePlayerId: ownerId,
            sourceUnitId: unit.matchUnitId,
            trigger: "PASSIVE",
            text: "Na primeira vez em que outro aliado ativar DESCONEXÃO a cada turno, devolva um Controolz de custo 1 do seu descarte à mão.",
            reason: "DECISION_REQUIRED",
            decisionKey: "iriaReturn",
          });
        } else {
          const def = cardById(catalogue, chosen);
          const discard = getPlayer(next, ownerId).discard;
          const index = discard.indexOf(chosen);
          if (def.type === "CONTROOLZ" && def.cost === 1 && index >= 0) {
            next = updatePlayer(next, ownerId, (player) => ({
              ...player,
              discard: [...player.discard.slice(0, index), ...player.discard.slice(index + 1)],
              hand: [...player.hand, chosen],
            }));
            next = incrementRuntimeCounter(next, ownerId, "cardsLeftDiscard", 1);
            next = setRuntimeCounter(next, ownerId, key, 1);
          }
        }
      }
    }
  }

  void disconnectedDefinitionId;
  return { state: next, pendingEffects };
}

export function afterSet001CardLeavesDiscard(
  state: MatchState,
  playerId: string,
): MatchState {
  let next = state;
  for (const unit of getPlayer(next, playerId).board) {
    if (!unit || unit.definitionId !== "SET001-0132") continue;
    const key = `comedorEcos:${unit.matchUnitId}`;
    if (getRuntimeCounter(next, playerId, key) === 0) {
      next = applyPermanent(next, unit.matchUnitId, 1, 1);
      next = setRuntimeCounter(next, playerId, key, 1);
    }
  }
  return next;
}

export function afterSet001UnitReturnedToHand(
  state: MatchState,
  ownerId: string,
  returnedDefinitionId: string,
  choices?: RuntimeChoiceBindings,
): Set001EventResult {
  let next = state;
  const pendingEffects: Set001RuntimePending[] = [];
  if (
    returnedDefinitionId === "SET001-0095" &&
    getRuntimeCounter(next, ownerId, "liliReturned") === 0
  ) {
    next = drawCards(next, ownerId, 1);
    const chosen = choices?.cards?.liliDiscard?.[0];
    if (!chosen) {
      pendingEffects.push({
        cardId: "SET001-0095",
        sourcePlayerId: ownerId,
        trigger: "PASSIVE",
        text: "Na primeira vez em que voltar do campo para sua mão a cada turno, compre uma carta e depois descarte uma.",
        reason: "DECISION_REQUIRED",
        decisionKey: "liliDiscard",
      });
    } else {
      const hand = getPlayer(next, ownerId).hand;
      const index = hand.indexOf(chosen);
      if (index >= 0) {
        next = updatePlayer(next, ownerId, (player) => ({
          ...player,
          hand: [...player.hand.slice(0, index), ...player.hand.slice(index + 1)],
          discard: [...player.discard, chosen],
        }));
        next = setRuntimeCounter(next, ownerId, "liliReturned", 1);
      }
    }
  }
  return { state: next, pendingEffects };
}

export function afterSet001StatsSwapped(
  state: MatchState,
  changedUnitId: string,
  ownerWhoCausedSwap: string,
  choices?: RuntimeChoiceBindings,
): Set001EventResult {
  let next = incrementRuntimeCounter(state, ownerWhoCausedSwap, "statsSwapped", 1);
  const pendingEffects: Set001RuntimePending[] = [];
  for (const location of allUnits(next)) {
    const ownerId = location.unit.ownerPlayerId;
    if (location.unit.definitionId === "SET001-0096" && location.unit.matchUnitId !== changedUnitId) {
      const key = `paradoxo:${location.unit.matchUnitId}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = applyPermanent(next, location.unit.matchUnitId, 1, 1);
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
    if (location.unit.definitionId === "SET001-0106" || location.unit.definitionId === "SET001-0108") {
      const key = `${location.unit.definitionId}:${location.unit.matchUnitId}:swapDraw`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = drawCards(next, ownerId, 1);
        const chosen = choices?.cards?.swapDiscard?.[0];
        if (!chosen) {
          pendingEffects.push({
            cardId: location.unit.definitionId,
            sourcePlayerId: ownerId,
            sourceUnitId: location.unit.matchUnitId,
            trigger: "PASSIVE",
            text: "Na primeira vez em que ATQ e DEF forem trocados a cada turno, compre uma carta e depois descarte uma.",
            reason: "DECISION_REQUIRED",
            decisionKey: "swapDiscard",
          });
        } else {
          const hand = getPlayer(next, ownerId).hand;
          const index = hand.indexOf(chosen);
          if (index >= 0) {
            next = updatePlayer(next, ownerId, (player) => ({
              ...player,
              hand: [...player.hand.slice(0, index), ...player.hand.slice(index + 1)],
              discard: [...player.discard, chosen],
            }));
            next = setRuntimeCounter(next, ownerId, key, 1);
          }
        }
      }
    }
  }
  return { state: next, pendingEffects };
}

export function beforeSet001UnitWouldDisconnectFromDamage(
  state: MatchState,
  targetUnitId: string,
  catalogue: readonly CardDefinition[],
): { state: MatchState; survives: boolean } {
  let next = state;
  const target = findUnit(next, targetUnitId);
  if (!target) return { state: next, survives: false };
  const ownerId = target.unit.ownerPlayerId;

  // Helena-0 Cadete: may take 2 to leave another ally at 1 DEF, once/turn.
  const helena = getPlayer(next, ownerId).board.find(
    (unit) => unit?.definitionId === "SET001-0159" && unit.matchUnitId !== targetUnitId,
  );
  if (helena && getRuntimeCounter(next, ownerId, `helenaCadete:${helena.matchUnitId}`) === 0) {
    const helenaLocation = findUnit(next, helena.matchUnitId);
    if (helenaLocation && helenaLocation.unit.currentDefense > 2) {
      next = replaceUnit(next, helenaLocation, {
        ...helenaLocation.unit,
        currentDefense: helenaLocation.unit.currentDefense - 2,
      });
      const freshTarget = findUnit(next, targetUnitId);
      if (freshTarget) {
        next = replaceUnit(next, freshTarget, { ...freshTarget.unit, currentDefense: 1 });
        next = setRuntimeCounter(next, ownerId, `helenaCadete:${helena.matchUnitId}`, 1);
        return { state: next, survives: true };
      }
    }
  }

  // Helena-0 Linha Final: first other ally with printed/effective DEF >=5 survives at 1.
  const linhaFinal = getPlayer(next, ownerId).board.find(
    (unit) => unit?.definitionId === "SET001-0166" && unit.matchUnitId !== targetUnitId,
  );
  if (linhaFinal) {
    const key = `helenaFinal:${linhaFinal.matchUnitId}`;
    if (getRuntimeCounter(next, ownerId, key) === 0) {
      const definition = cardById(catalogue, target.unit.definitionId);
      if (definition.type === "CONTROOLZ" && Math.max(definition.defense, target.unit.maxDefense) >= 5) {
        const freshTarget = findUnit(next, targetUnitId);
        if (freshTarget) {
          next = replaceUnit(next, freshTarget, { ...freshTarget.unit, currentDefense: 1 });
          next = setRuntimeCounter(next, ownerId, key, 1);
          return { state: next, survives: true };
        }
      }
    }
  }

  return { state: next, survives: false };
}

export function getSet001EffectiveAttack(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
  attackingController = false,
): number {
  const modifiers = getUnitModifiers(state, unit.matchUnitId);
  const setStats = firstActiveModifier(modifiers, "SET_STATS", state.turn);
  let attack = setStats ? Number(setStats.data?.attack ?? 0) : getBaseAttack(state, unit, catalogue);
  const swapCount = modifiers.filter(
    (modifier) =>
      modifier.kind === "SWAP_STATS" &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  ).length;
  if (swapCount % 2 === 1) attack = getSet001EffectiveDefense(state, unit, catalogue, true);

  if (unit.definitionId === "SET001-0018") {
    const owner = getPlayer(state, unit.ownerPlayerId);
    if (owner.turnStats.unitsAttacked > 0) attack += 2;
  }
  if (attackingController) {
    const opponent = getOpponent(state, unit.ownerPlayerId);
    if (opponent.board.some((enemy) => enemy?.definitionId === "SET001-0161")) attack -= 1;
  }
  return Math.max(0, attack);
}

export function getSet001EffectiveDefense(
  state: MatchState,
  unit: UnitState,
  catalogue: readonly CardDefinition[],
  ignoreSwap = false,
): number {
  const modifiers = getUnitModifiers(state, unit.matchUnitId);
  const setStats = firstActiveModifier(modifiers, "SET_STATS", state.turn);
  let defense = setStats
    ? Number(setStats.data?.defense ?? 0) + temporaryDefenseAmount(state, unit.matchUnitId)
    : getBaseDefense(state, unit, catalogue);
  if (!ignoreSwap) {
    const swapCount = modifiers.filter(
      (modifier) =>
        modifier.kind === "SWAP_STATS" &&
        (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
    ).length;
    if (swapCount % 2 === 1) {
      const baseAttack = setStats ? Number(setStats.data?.attack ?? 0) : getBaseAttack(state, unit, catalogue);
      defense = Math.max(0, baseAttack);
    }
  }
  return Math.max(0, defense);
}

export function getSet001TauntTarget(
  state: MatchState,
  defenderPlayerId: string,
): UnitState | null {
  const player = getPlayer(state, defenderPlayerId);
  return (
    player.board.find((unit) => unit?.definitionId === "SET001-0165") ??
    player.board.find((unit) => unit?.definitionId === "SET001-0154") ??
    null
  );
}

export function isSet001CommandTargetProtected(
  state: MatchState,
  sourcePlayerId: string,
  targetUnit: UnitState,
): boolean {
  const ownerId = targetUnit.ownerPlayerId;
  if (targetUnit.definitionId === "SET001-0192" && ownerId === sourcePlayerId) return true;
  const firstImmunity = firstActiveModifier(
    getUnitModifiers(state, targetUnit.matchUnitId),
    "IGNORE_NEXT_ENEMY_COMMAND",
    state.turn,
  );
  if (firstImmunity && ownerId !== sourcePlayerId) return true;
  return false;
}

export function prepareSet001CommandTargeting(
  state: MatchState,
  sourcePlayerId: string,
  targetUnitIds: readonly string[],
  catalogue: readonly CardDefinition[],
): MatchState {
  let next = state;
  for (const id of targetUnitIds) {
    const target = findUnit(next, id);
    if (!target) continue;
    const ownerId = target.unit.ownerPlayerId;
    if (ownerId === sourcePlayerId) continue;
    if (target.unit.definitionId === "SET001-0163") {
      const key = `bastiao:${id}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        next = addUnitModifier(next, id, {
          kind: "IGNORE_NEXT_ENEMY_COMMAND",
          expiresAtTurn: next.turn,
          sourceCardId: "SET001-0163",
        });
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
    if (target.unit.definitionId === "SET001-0089") {
      const key = `bolha404:${id}`;
      if (getRuntimeCounter(next, ownerId, key) === 0) {
        // The optional top-to-bottom payment is resolved by UI/runtime choices later.
        next = setRuntimeCounter(next, ownerId, key, 1);
      }
    }
  }
  void catalogue;
  return next;
}

export function afterSet001TurnStart(
  state: MatchState,
  playerId: string,
  catalogue: readonly CardDefinition[],
): MatchState {
  let next = state;
  next = setRuntimeCounter(next, playerId, "signalDamageSinceOwnTurn", 0);
  for (const unit of getPlayer(next, playerId).board) {
    if (!unit) continue;
    if (unit.definitionId === "SET001-0076") {
      const before = unit.currentDefense;
      const after = Math.min(unit.maxDefense, before + 2);
      if (after > before) {
        const location = findUnit(next, unit.matchUnitId);
        if (location) next = replaceUnit(next, location, { ...location.unit, currentDefense: after });
        next = afterSet001DefenseRecovered(next, unit.matchUnitId, after - before, catalogue);
      }
    }
  }
  return next;
}

export function resolveSet001EndTurnDamage(
  state: MatchState,
  playerId: string,
  catalogue: readonly CardDefinition[],
  callbacks: Set001RuntimeCallbacks,
  targets?: RuntimeTargetBindings,
  choices?: RuntimeChoiceBindings,
): Set001EventResult {
  let next = state;
  const pendingEffects: Set001RuntimePending[] = [];
  for (const unit of getPlayer(next, playerId).board) {
    if (!unit || unit.attacksUsedThisTurn <= 0) continue;
    const modifier = firstActiveModifier(
      getUnitModifiers(next, unit.matchUnitId),
      "END_TURN_DAMAGE_IF_ATTACKED",
      next.turn,
    );
    if (modifier) {
      const result = callbacks.damageUnit(next, unit.matchUnitId, Number(modifier.data?.amount ?? 2), targets, choices);
      next = result.state;
      pendingEffects.push(...result.pendingEffects);
    }
  }
  void catalogue;
  return { state: next, pendingEffects };
}

export function afterSet001AttackResolved(
  state: MatchState,
  attackerUnitId: string,
  catalogue: readonly CardDefinition[],
  callbacks: Set001RuntimeCallbacks,
  targets?: RuntimeTargetBindings,
  choices?: RuntimeChoiceBindings,
): Set001EventResult {
  let next = state;
  const attacker = findUnit(next, attackerUnitId);
  if (!attacker) return { state: next, pendingEffects: [] };
  if (attacker.unit.attacksUsedThisTurn === 1) {
    const modifier = firstActiveModifier(
      getUnitModifiers(next, attackerUnitId),
      "DAMAGE_AFTER_FIRST_ATTACK",
      next.turn,
    );
    if (modifier) {
      return callbacks.damageUnit(
        next,
        attackerUnitId,
        Number(modifier.data?.amount ?? 2),
        targets,
        choices,
      );
    }
  }
  void catalogue;
  return { state: next, pendingEffects: [] };
}
