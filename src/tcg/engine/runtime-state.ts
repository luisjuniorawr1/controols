import type { MatchRuntimeState, MatchState, RuntimeModifier } from "../domain";

export function emptyMatchRuntimeState(): MatchRuntimeState {
  return {
    unitModifiers: {},
    playerModifiers: {},
    exileByPlayer: {},
    turnCounters: {},
    sequence: 0,
  };
}

export function ensureRuntime(state: MatchState): MatchState & { runtime: MatchRuntimeState } {
  if (state.runtime) return state as MatchState & { runtime: MatchRuntimeState };
  return { ...state, runtime: emptyMatchRuntimeState() };
}

function nextRuntimeSequence(state: MatchState & { runtime: MatchRuntimeState }): number {
  return state.runtime.sequence + 1;
}

export function createRuntimeModifier(
  state: MatchState,
  input: Omit<RuntimeModifier, "id" | "createdTurn"> & { idPrefix?: string },
): RuntimeModifier {
  const ready = ensureRuntime(state);
  const sequence = nextRuntimeSequence(ready);
  return {
    ...input,
    id: `${input.idPrefix ?? input.kind}:${ready.turn}:${sequence}`,
    createdTurn: ready.turn,
  };
}

function bumpSequence(state: MatchState & { runtime: MatchRuntimeState }): MatchState & { runtime: MatchRuntimeState } {
  return {
    ...state,
    runtime: { ...state.runtime, sequence: state.runtime.sequence + 1 },
  };
}

export function addUnitModifier(
  state: MatchState,
  matchUnitId: string,
  modifier: Omit<RuntimeModifier, "id" | "createdTurn"> & { idPrefix?: string },
): MatchState {
  let ready = ensureRuntime(state);
  const built = createRuntimeModifier(ready, modifier);
  ready = bumpSequence(ready);
  const current = ready.runtime.unitModifiers[matchUnitId] ?? [];
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      unitModifiers: {
        ...ready.runtime.unitModifiers,
        [matchUnitId]: [...current, built],
      },
    },
  };
}

export function addPlayerModifier(
  state: MatchState,
  playerId: string,
  modifier: Omit<RuntimeModifier, "id" | "createdTurn"> & { idPrefix?: string },
): MatchState {
  let ready = ensureRuntime(state);
  const built = createRuntimeModifier(ready, modifier);
  ready = bumpSequence(ready);
  const current = ready.runtime.playerModifiers[playerId] ?? [];
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      playerModifiers: {
        ...ready.runtime.playerModifiers,
        [playerId]: [...current, built],
      },
    },
  };
}

export function getUnitModifiers(state: MatchState, matchUnitId: string): readonly RuntimeModifier[] {
  return state.runtime?.unitModifiers[matchUnitId] ?? [];
}

export function getPlayerModifiers(state: MatchState, playerId: string): readonly RuntimeModifier[] {
  return state.runtime?.playerModifiers[playerId] ?? [];
}

export function removeUnitModifiers(
  state: MatchState,
  matchUnitId: string,
  predicate: (modifier: RuntimeModifier) => boolean,
): MatchState {
  const ready = ensureRuntime(state);
  const current = ready.runtime.unitModifiers[matchUnitId] ?? [];
  const kept = current.filter((modifier) => !predicate(modifier));
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      unitModifiers: { ...ready.runtime.unitModifiers, [matchUnitId]: kept },
    },
  };
}

export function removePlayerModifiers(
  state: MatchState,
  playerId: string,
  predicate: (modifier: RuntimeModifier) => boolean,
): MatchState {
  const ready = ensureRuntime(state);
  const current = ready.runtime.playerModifiers[playerId] ?? [];
  const kept = current.filter((modifier) => !predicate(modifier));
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      playerModifiers: { ...ready.runtime.playerModifiers, [playerId]: kept },
    },
  };
}

export function markModifierUsedThisTurn(
  state: MatchState,
  scope: "UNIT" | "PLAYER",
  scopeId: string,
  modifierId: string,
): MatchState {
  const ready = ensureRuntime(state);
  const source = scope === "UNIT" ? ready.runtime.unitModifiers : ready.runtime.playerModifiers;
  const current = source[scopeId] ?? [];
  const next = current.map((modifier) =>
    modifier.id === modifierId ? { ...modifier, usedTurn: ready.turn } : modifier,
  );
  if (scope === "UNIT") {
    return {
      ...ready,
      runtime: {
        ...ready.runtime,
        unitModifiers: { ...ready.runtime.unitModifiers, [scopeId]: next },
      },
    };
  }
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      playerModifiers: { ...ready.runtime.playerModifiers, [scopeId]: next },
    },
  };
}

export function cleanupExpiredRuntime(state: MatchState): MatchState {
  const ready = ensureRuntime(state);
  const cleanRecord = (
    record: Readonly<Record<string, readonly RuntimeModifier[]>>,
  ): Record<string, readonly RuntimeModifier[]> =>
    Object.fromEntries(
      Object.entries(record).map(([id, modifiers]) => [
        id,
        modifiers.filter(
          (modifier) => modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= ready.turn,
        ),
      ]),
    );

  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      unitModifiers: cleanRecord(ready.runtime.unitModifiers),
      playerModifiers: cleanRecord(ready.runtime.playerModifiers),
    },
  };
}

export function runtimeCounterKey(playerId: string, key: string): string {
  return `${playerId}:${key}`;
}

export function getRuntimeCounter(state: MatchState, playerId: string, key: string): number {
  return state.runtime?.turnCounters[runtimeCounterKey(playerId, key)] ?? 0;
}

export function setRuntimeCounter(
  state: MatchState,
  playerId: string,
  key: string,
  value: number,
): MatchState {
  const ready = ensureRuntime(state);
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      turnCounters: {
        ...ready.runtime.turnCounters,
        [runtimeCounterKey(playerId, key)]: Math.max(0, Math.trunc(value)),
      },
    },
  };
}

function triggerNoraCalculistaAfterBottom(
  state: MatchState,
  playerId: string,
): MatchState {
  const player = state.players.find((candidate) => candidate.playerId === playerId);
  if (!player) return state;
  if (!player.board.some((unit) => unit?.definitionId === "SET001-0046")) return state;
  if (getRuntimeCounter(state, playerId, "noraCalculistaTriggered") > 0) return state;

  let next = setRuntimeCounter(state, playerId, "noraCalculistaTriggered", 1);
  const refreshed = next.players.find((candidate) => candidate.playerId === playerId)!;
  const drawBlocked = getPlayerModifiers(next, playerId).some(
    (modifier) =>
      modifier.kind === "NO_MORE_DRAW" &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= next.turn),
  );

  if (!drawBlocked && refreshed.deck.length > 0) {
    const drawn = refreshed.deck[0];
    next = {
      ...next,
      players: next.players.map((candidate) =>
        candidate.playerId === playerId
          ? {
              ...candidate,
              deck: candidate.deck.slice(1),
              hand: [...candidate.hand, drawn],
            }
          : candidate,
      ) as MatchState["players"],
    };
  }

  if (next.players.find((candidate) => candidate.playerId === playerId)!.hand.length > 0) {
    next = addPlayerModifier(next, playerId, {
      kind: "PENDING_DISCARD",
      amount: 1,
      sourceCardId: "SET001-0046",
      data: { choiceKey: "noraCalculistaDiscard" },
    });
  }
  return next;
}

/**
 * Resolves a deferred own-hand discard created by effects that must draw before
 * the player can choose what to discard. This is intentionally server-side so
 * the future mobile UI only submits a card id; it never mutates the hand.
 */
export function resolvePendingDiscard(
  state: MatchState,
  playerId: string,
  definitionId: string,
): MatchState {
  const pending = getPlayerModifiers(state, playerId).find(
    (modifier) =>
      modifier.kind === "PENDING_DISCARD" &&
      (modifier.amount ?? 0) > 0 &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
  if (!pending) throw new Error("Não existe descarte pendente para este Controller.");

  const playerIndex = state.players.findIndex((candidate) => candidate.playerId === playerId);
  if (playerIndex < 0) throw new Error("Controller não pertence à partida.");
  const player = state.players[playerIndex];
  const cardIndex = player.hand.indexOf(definitionId);
  if (cardIndex < 0) throw new Error("A carta escolhida para descarte não está na mão.");

  const players = [...state.players] as [typeof state.players[0], typeof state.players[1]];
  players[playerIndex] = {
    ...player,
    hand: [...player.hand.slice(0, cardIndex), ...player.hand.slice(cardIndex + 1)],
    discard: [...player.discard, definitionId],
  };
  let next: MatchState = { ...state, players };
  next = removePlayerModifiers(next, playerId, (modifier) => modifier.id === pending.id);
  return next;
}

export function hasPendingRuntimeDecision(state: MatchState, playerId: string): boolean {
  return getPlayerModifiers(state, playerId).some(
    (modifier) =>
      modifier.kind === "PENDING_DISCARD" &&
      (modifier.amount ?? 0) > 0 &&
      (modifier.expiresAtTurn === undefined || modifier.expiresAtTurn >= state.turn),
  );
}

export function incrementRuntimeCounter(
  state: MatchState,
  playerId: string,
  key: string,
  amount = 1,
): MatchState {
  const previous = getRuntimeCounter(state, playerId, key);
  let next = setRuntimeCounter(state, playerId, key, previous + amount);
  if (key === "cardsPutBottom" && amount > 0) {
    next = triggerNoraCalculistaAfterBottom(next, playerId);
  }
  return next;
}

export function resetRuntimeCountersForPlayer(state: MatchState, playerId: string): MatchState {
  const ready = ensureRuntime(state);
  const prefix = `${playerId}:`;
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      turnCounters: Object.fromEntries(
        Object.entries(ready.runtime.turnCounters).filter(([key]) => !key.startsWith(prefix)),
      ),
    },
  };
}

export function exileCard(
  state: MatchState,
  playerId: string,
  definitionId: string,
): MatchState {
  const ready = ensureRuntime(state);
  const current = ready.runtime.exileByPlayer[playerId] ?? [];
  return {
    ...ready,
    runtime: {
      ...ready.runtime,
      exileByPlayer: {
        ...ready.runtime.exileByPlayer,
        [playerId]: [...current, definitionId],
      },
    },
  };
}
