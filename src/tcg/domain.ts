export const CARD_CLASSES = [
  "RAGE",
  "LOGIC",
  "WILD",
  "GLITCH",
  "VOID",
  "PRIME",
  "NEUTRAL",
] as const;

export type CardClass = (typeof CARD_CLASSES)[number];

export const CARD_RARITIES = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
] as const;

export type CardRarity = (typeof CARD_RARITIES)[number];

export const CARD_TYPES = ["CONTROOLZ", "COMMAND"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const EFFECT_TRIGGERS = [
  "CONNECTION",
  "DISCONNECTION",
  "PASSIVE",
  "ON_ATTACK",
  "ON_DAMAGE",
  "TURN_START",
  "TURN_END",
  "COMMAND_RESOLVE",
] as const;

export type EffectTrigger = (typeof EFFECT_TRIGGERS)[number];

export type EffectLimit =
  | { type: "ONCE_PER_TURN" }
  | { type: "ONCE_PER_MATCH" }
  | { type: "FIRST_TIME_EACH_TURN" }
  | { type: "MAX_TRIGGERS_PER_TURN"; amount: number };

export type TargetSelector =
  | "SELF"
  | "ALLY_CONTROOLZ"
  | "OTHER_ALLY_CONTROOLZ"
  | "ENEMY_CONTROOLZ"
  | "ANY_CONTROOLZ"
  | "ALLY_CONTROLLER"
  | "ENEMY_CONTROLLER"
  | "ALL_OTHER_CONTROOLZ"
  | "ALL_ALLY_CONTROOLZ"
  | "ALL_ENEMY_CONTROOLZ"
  | "RANDOM_ALLY_CONTROOLZ"
  | "RANDOM_ENEMY_CONTROOLZ";

/**
 * Structured effects are deliberately explicit. The engine never interprets
 * Portuguese rules text as executable code. Complex Set 001 cards can keep
 * their player-facing text while their runtime behavior is added separately.
 */
export type EffectAction =
  | { type: "DEAL_DAMAGE"; amount: number; target: TargetSelector }
  | { type: "RESTORE_DEFENSE"; amount: number; target: TargetSelector }
  | {
      type: "MODIFY_ATTACK";
      amount: number;
      target: TargetSelector;
      duration: "TURN" | "PERMANENT";
    }
  | {
      type: "MODIFY_DEFENSE";
      amount: number;
      target: TargetSelector;
      duration: "TURN" | "PERMANENT";
    }
  | { type: "DRAW"; amount: number; player?: "SELF" | "OPPONENT" }
  | { type: "DISCARD_RANDOM"; amount: number; player: "SELF" | "OPPONENT" }
  | { type: "DESTROY"; target: TargetSelector }
  | { type: "RETURN_TO_HAND"; target: TargetSelector }
  | { type: "CHANGE_SIGNAL"; amount: number; player: "SELF" | "OPPONENT" }
  | { type: "CHANGE_ENERGY"; amount: number; player: "SELF" | "OPPONENT" };

export interface CardEffect {
  trigger: EffectTrigger;
  /** Final player-facing wording printed on the card. */
  text: string;
  /** Structured implementation used by the deterministic engine. */
  actions?: readonly EffectAction[];
  limits?: readonly EffectLimit[];
}

export interface CardBaseDefinition {
  /** Stable id. Never reuse an id for a different card. Example: SET001-0042. */
  id: string;
  setId: string;
  collectorNumber: number;
  name: string;
  cardClass: CardClass;
  rarity: CardRarity;
  cost: number;
  /** Short optional subtype used for flavor/search, not for hidden rules. */
  subtype?: string;
  /** Complete concise rules text as shown to the player. */
  rulesText: string;
  /** Internal design tags; not necessarily displayed in-game. */
  archetypes?: readonly string[];
  effects?: readonly CardEffect[];
  flavorText?: string;
  enabled?: boolean;
}

export interface ControolzCardDefinition extends CardBaseDefinition {
  type: "CONTROOLZ";
  attack: number;
  defense: number;
}

export interface CommandCardDefinition extends CardBaseDefinition {
  type: "COMMAND";
}

export type CardDefinition = ControolzCardDefinition | CommandCardDefinition;

/**
 * A collectible copy is separate from the card definition. This lets two
 * mechanically identical cards have different ownership/history/cosmetics.
 */
export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: string;
  obtainedAt: string;
  source:
    | "REWARDED_PACK"
    | "MISSION_PACK"
    | "EVENT"
    | "TRADE"
    | "MARKET"
    | "ADMIN";
  cosmeticVariant?: string;
  previousOwnerCount?: number;
}

export interface DeckListEntry {
  definitionId: string;
  count: number;
}

export interface DeckDefinition {
  id: string;
  ownerId: string;
  name: string;
  cards: readonly DeckListEntry[];
  primaryClass?: CardClass;
  rulesVersion: string;
}

export type LaneIndex = 0 | 1 | 2;

export type MatchPhase =
  | "RECHARGE"
  | "DRAW"
  | "CONTROL"
  | "COMBAT"
  | "END"
  | "FINISHED";

export interface UnitState {
  matchUnitId: string;
  definitionId: string;
  ownerPlayerId: string;
  lane: LaneIndex;
  attack: number;
  maxDefense: number;
  currentDefense: number;
  enteredOnTurn: number;
  attacksUsedThisTurn: number;
  canAttackOnDeploy: boolean;
}

export type BoardState = [UnitState | null, UnitState | null, UnitState | null];

export interface PlayerTurnStats {
  damageTaken: number;
  unitsAttacked: number;
  unitsDestroyed: number;
  cardsPlayed: number;
  commandsPlayed: number;
  disconnectionsTriggered: number;
}

export interface PlayerMatchState {
  playerId: string;
  signal: number;
  maxEnergy: number;
  energy: number;
  /** Number of turns this player has actually started; fixes energy growth symmetry. */
  ownTurnsStarted: number;
  deck: readonly string[];
  hand: readonly string[];
  discard: readonly string[];
  board: BoardState;
  turnStats: PlayerTurnStats;
}

export type MatchOutcomeReason =
  | "SIGNAL_ZERO"
  | "SURRENDER"
  | "DISCONNECT_FORFEIT"
  | "ADMIN"
  | "DRAW_PENDING_RULE";

export interface MatchOutcome {
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  reason: MatchOutcomeReason;
}

export interface MatchState {
  matchId: string;
  rulesVersion: string;
  cardPoolVersion: string;
  /** Global turn sequence, starting at 1. */
  turn: number;
  activePlayerId: string;
  phase: MatchPhase;
  players: [PlayerMatchState, PlayerMatchState];
  outcome: MatchOutcome | null;
}

export type MatchEventType =
  | "MATCH_CREATED"
  | "TURN_STARTED"
  | "CARD_DRAWN"
  | "CARD_PLAYED"
  | "COMMAND_RESOLVED"
  | "CONTROOLZ_CONNECTED"
  | "CONTROOLZ_MOVED"
  | "ATTACK_DECLARED"
  | "DAMAGE_DEALT"
  | "CONTROOLZ_DISCONNECTED"
  | "SIGNAL_CHANGED"
  | "TURN_ENDED"
  | "MATCH_FINISHED";

export interface MatchEvent<TPayload = Record<string, unknown>> {
  id: string;
  matchId: string;
  sequence: number;
  type: MatchEventType;
  createdAt: string;
  payload: TPayload;
}

export interface RankedProfile {
  playerId: string;
  seasonId: string;
  wins: number;
  losses: number;
  draws: number;
  rankedCompletedMatches: number;
  distinctRankedOpponents: number;
  rankingEligible: boolean;
}
