import type {
  BoardState,
  MatchOutcome,
  MatchState,
  PlayerMatchState,
} from "../domain";
import { DEFAULT_GAME_RULES, type GameRulesConfig } from "../rules";

export interface CreateMatchInput {
  matchId: string;
  playerAId: string;
  playerBId: string;
  /** Decks must already be shuffled/deterministically ordered by the server. */
  playerADeck: readonly string[];
  playerBDeck: readonly string[];
  firstPlayerId: string;
  cardPoolVersion: string;
  rules?: GameRulesConfig;
}

function emptyBoard(): BoardState {
  return [null, null, null];
}

function createPlayerState(
  playerId: string,
  orderedDeck: readonly string[],
  rules: GameRulesConfig,
): PlayerMatchState {
  const openingHand = orderedDeck.slice(0, rules.startingHandSize);
  const remainingDeck = orderedDeck.slice(rules.startingHandSize);

  return {
    playerId,
    signal: rules.startingSignal,
    maxEnergy: rules.startingMaxEnergy,
    energy: rules.startingMaxEnergy,
    deck: remainingDeck,
    hand: openingHand,
    discard: [],
    board: emptyBoard(),
  };
}

export function createInitialMatchState(input: CreateMatchInput): MatchState {
  const rules = input.rules ?? DEFAULT_GAME_RULES;

  if (input.playerAId === input.playerBId) {
    throw new Error("Uma partida precisa de dois jogadores diferentes.");
  }

  if (
    input.firstPlayerId !== input.playerAId &&
    input.firstPlayerId !== input.playerBId
  ) {
    throw new Error("firstPlayerId precisa pertencer à partida.");
  }

  return {
    matchId: input.matchId,
    rulesVersion: rules.version,
    cardPoolVersion: input.cardPoolVersion,
    turn: 1,
    activePlayerId: input.firstPlayerId,
    phase: "CONTROL",
    players: [
      createPlayerState(input.playerAId, input.playerADeck, rules),
      createPlayerState(input.playerBId, input.playerBDeck, rules),
    ],
    outcome: null,
  };
}

export function getPlayerIndex(state: MatchState, playerId: string): 0 | 1 {
  if (state.players[0].playerId === playerId) return 0;
  if (state.players[1].playerId === playerId) return 1;
  throw new Error(`Jogador ${playerId} não pertence à partida.`);
}

export function getOpponentIndex(state: MatchState, playerId: string): 0 | 1 {
  return getPlayerIndex(state, playerId) === 0 ? 1 : 0;
}

export function getPlayer(state: MatchState, playerId: string): PlayerMatchState {
  return state.players[getPlayerIndex(state, playerId)];
}

export function getOpponent(state: MatchState, playerId: string): PlayerMatchState {
  return state.players[getOpponentIndex(state, playerId)];
}

function replacePlayer(
  state: MatchState,
  playerIndex: 0 | 1,
  nextPlayer: PlayerMatchState,
): MatchState {
  const players: [PlayerMatchState, PlayerMatchState] =
    playerIndex === 0
      ? [nextPlayer, state.players[1]]
      : [state.players[0], nextPlayer];

  return { ...state, players };
}

export function changeSignal(
  state: MatchState,
  playerId: string,
  delta: number,
): MatchState {
  if (state.outcome) return state;
  if (!Number.isFinite(delta)) throw new Error("delta de SINAL inválido.");

  const playerIndex = getPlayerIndex(state, playerId);
  const player = state.players[playerIndex];
  const nextSignal = Math.max(0, player.signal + Math.trunc(delta));
  const nextState = replacePlayer(state, playerIndex, {
    ...player,
    signal: nextSignal,
  });

  return resolveSignalOutcome(nextState);
}

/**
 * Resolves only the universal SINAL victory rule. Card effects and surrender
 * resolve elsewhere, but all paths should eventually call this helper.
 */
export function resolveSignalOutcome(state: MatchState): MatchState {
  const [a, b] = state.players;
  const aLost = a.signal <= 0;
  const bLost = b.signal <= 0;

  if (!aLost && !bLost) return state;

  let outcome: MatchOutcome;

  if (aLost && bLost) {
    outcome = {
      winnerPlayerId: null,
      loserPlayerId: null,
      reason: "DRAW_PENDING_RULE",
    };
  } else if (aLost) {
    outcome = {
      winnerPlayerId: b.playerId,
      loserPlayerId: a.playerId,
      reason: "SIGNAL_ZERO",
    };
  } else {
    outcome = {
      winnerPlayerId: a.playerId,
      loserPlayerId: b.playerId,
      reason: "SIGNAL_ZERO",
    };
  }

  return { ...state, phase: "FINISHED", outcome };
}

export function drawCards(
  state: MatchState,
  playerId: string,
  amount = 1,
): MatchState {
  if (state.outcome) return state;
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Quantidade de compra inválida.");
  }
  if (amount === 0) return state;

  const playerIndex = getPlayerIndex(state, playerId);
  const player = state.players[playerIndex];
  const actualAmount = Math.min(amount, player.deck.length);
  const drawn = player.deck.slice(0, actualAmount);

  return replacePlayer(state, playerIndex, {
    ...player,
    deck: player.deck.slice(actualAmount),
    hand: [...player.hand, ...drawn],
  });
}

export function spendEnergy(
  state: MatchState,
  playerId: string,
  amount: number,
): MatchState {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Custo de energia inválido.");
  }

  const playerIndex = getPlayerIndex(state, playerId);
  const player = state.players[playerIndex];

  if (player.energy < amount) {
    throw new Error("Energia insuficiente.");
  }

  return replacePlayer(state, playerIndex, {
    ...player,
    energy: player.energy - amount,
  });
}

export function preparePlayerTurn(
  state: MatchState,
  playerId: string,
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
): MatchState {
  if (state.outcome) return state;

  const playerIndex = getPlayerIndex(state, playerId);
  const player = state.players[playerIndex];
  const isFirstTurnForMatch = state.turn === 1;
  const nextMaxEnergy = isFirstTurnForMatch
    ? player.maxEnergy
    : Math.min(
        rules.maxEnergy,
        player.maxEnergy + rules.energyGrowthPerOwnTurn,
      );

  const refreshedBoard: BoardState = player.board.map((unit) =>
    unit ? { ...unit, attacksUsedThisTurn: 0 } : null,
  ) as BoardState;

  let nextState = replacePlayer(state, playerIndex, {
    ...player,
    maxEnergy: nextMaxEnergy,
    energy: nextMaxEnergy,
    board: refreshedBoard,
  });

  nextState = drawCards(nextState, playerId, rules.drawPerTurn);

  return {
    ...nextState,
    activePlayerId: playerId,
    phase: "CONTROL",
  };
}
