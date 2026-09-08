import type { CardClass, CardInstance, DeckDefinition } from "./domain";

export type PackType = "SPONSORED" | "MISSION" | "CLASS" | "SPECIAL" | "EVENT";

export interface PackDropWeight {
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  weight: number;
}

export interface PackDefinition {
  id: string;
  name: string;
  type: PackType;
  cardCount: number;
  dropTableVersion: string;
  rarityWeights: readonly PackDropWeight[];
  preferredClass?: CardClass;
}

export interface PackEntitlement {
  entitlementId: string;
  playerId: string;
  packDefinitionId: string;
  source: "REWARDED_AD" | "COMPLETED_MATCHES" | "COINS" | "EVENT" | "ADMIN";
  grantedAt: string;
  consumedAt: string | null;
}

export interface PackOpeningResult {
  openingId: string;
  playerId: string;
  entitlementId: string;
  dropTableVersion: string;
  cards: readonly CardInstance[];
  openedAt: string;
}

export interface WalletState {
  playerId: string;
  coins: number;
  updatedAt: string;
}

export type WalletTransactionReason =
  | "DUPLICATE_RECYCLE"
  | "PACK_PURCHASE"
  | "PLAYER_TRADE"
  | "EVENT_REWARD"
  | "ADMIN_ADJUSTMENT";

export interface WalletTransaction {
  transactionId: string;
  playerId: string;
  delta: number;
  reason: WalletTransactionReason;
  createdAt: string;
  relatedEntityId?: string;
}

export interface PresenceChallenge {
  challengeId: string;
  hostPlayerId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
}

export interface PresencePairing {
  pairingId: string;
  challengeId: string;
  playerAId: string;
  playerBId: string;
  confirmedAt: string;
  expiresAt: string;
}

export type MatchValidationStatus =
  | "PENDING"
  | "VALID"
  | "RANKED_INELIGIBLE"
  | "REWARD_INELIGIBLE"
  | "INVALID";

export interface MatchValidationSignals {
  durationSeconds: number;
  turnsCompleted: number;
  playerAActions: number;
  playerBActions: number;
  sameOpponentMatchesLast24h: number;
  earlyDisconnect: boolean;
  repeatedPatternScore?: number;
}

export interface MatchValidationDecision {
  matchId: string;
  status: MatchValidationStatus;
  rankedEligible: boolean;
  rewardEligible: boolean;
  reasons: readonly string[];
  evaluatedAt: string;
}

export interface CompletedMatchRecord {
  matchId: string;
  seasonId: string;
  rulesVersion: string;
  cardPoolVersion: string;
  playerAId: string;
  playerBId: string;
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  completedAt: string;
  validation: MatchValidationDecision;
}

export interface PlayerDeckRecord extends DeckDefinition {
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export type TradeStatus =
  | "PROPOSED"
  | "ACCEPTED_A"
  | "ACCEPTED_B"
  | "READY_TO_SETTLE"
  | "SETTLED"
  | "CANCELLED"
  | "EXPIRED";

export interface TradeOfferSide {
  playerId: string;
  cardInstanceIds: readonly string[];
  coins: number;
  acceptedRevision: number | null;
}

export interface TradeProposal {
  tradeId: string;
  pairingId: string;
  revision: number;
  status: TradeStatus;
  sideA: TradeOfferSide;
  sideB: TradeOfferSide;
  createdAt: string;
  expiresAt: string;
  settledAt: string | null;
}

/**
 * Atomic trade invariant:
 * - every CardInstance must still belong to the offering player;
 * - both sides must have accepted the exact same revision;
 * - balances must be sufficient;
 * - pairing must still be valid;
 * - ownership + wallet changes must commit together or not at all.
 */
export function isTradeReadyForSettlement(trade: TradeProposal): boolean {
  return (
    trade.status === "READY_TO_SETTLE" &&
    trade.sideA.acceptedRevision === trade.revision &&
    trade.sideB.acceptedRevision === trade.revision
  );
}
