import type { CardDefinition, RankedProfile } from "./domain";

export interface GameRulesConfig {
  version: string;
  startingSignal: number;
  boardLaneCount: 3;
  startingMaxEnergy: number;
  maxEnergy: number;
  energyGrowthPerOwnTurn: number;
  startingHandSize: number;
  drawPerTurn: number;
  maxAttacksPerUnitPerTurn: number;
  deployedUnitsCanAttackByDefault: boolean;
  overflowDamageHitsControllerByDefault: boolean;
  rankedPlacementMatches: number;
  maxRankedMatchesPerOpponentPerDay: number;
  maxRewardEligibleMatchesPerOpponentPerDay: number;
  deck: {
    targetSize: number;
    maxCopiesPerDefinition: number;
  };
}

/**
 * Every number here is intentionally centralized so playtests can change the
 * format without scattering magic numbers through UI and engine code.
 */
export const DEFAULT_GAME_RULES: Readonly<GameRulesConfig> = {
  version: "0.1.0",
  startingSignal: 20,
  boardLaneCount: 3,
  startingMaxEnergy: 1,
  maxEnergy: 7,
  energyGrowthPerOwnTurn: 1,
  startingHandSize: 5,
  drawPerTurn: 1,
  maxAttacksPerUnitPerTurn: 1,
  deployedUnitsCanAttackByDefault: false,
  overflowDamageHitsControllerByDefault: false,
  rankedPlacementMatches: 30,
  maxRankedMatchesPerOpponentPerDay: 5,
  maxRewardEligibleMatchesPerOpponentPerDay: 3,
  deck: {
    targetSize: 24,
    maxCopiesPerDefinition: 2,
  },
};

export function clampSignal(signal: number): number {
  if (!Number.isFinite(signal)) return 0;
  return Math.max(0, Math.trunc(signal));
}

export function computeWinRate(profile: Pick<RankedProfile, "wins" | "losses">): number {
  const completed = profile.wins + profile.losses;
  if (completed <= 0) return 0;
  return profile.wins / completed;
}

export function computeWinRatePercent(
  profile: Pick<RankedProfile, "wins" | "losses">,
): number {
  return computeWinRate(profile) * 100;
}

export function isRankingEligible(
  profile: Pick<RankedProfile, "wins" | "losses">,
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
): boolean {
  return profile.wins + profile.losses >= rules.rankedPlacementMatches;
}

export interface DeckValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDeckDefinitions(
  definitionIds: readonly string[],
  catalogue: readonly CardDefinition[],
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
): DeckValidationResult {
  const errors: string[] = [];
  const catalogueById = new Map(catalogue.map((card) => [card.id, card] as const));

  if (definitionIds.length !== rules.deck.targetSize) {
    errors.push(
      `Deck precisa ter ${rules.deck.targetSize} cartas; recebeu ${definitionIds.length}.`,
    );
  }

  const counts = new Map<string, number>();

  for (const definitionId of definitionIds) {
    const card = catalogueById.get(definitionId);
    if (!card) {
      errors.push(`Carta desconhecida no deck: ${definitionId}.`);
      continue;
    }

    if (card.enabled === false) {
      errors.push(`Carta desabilitada no formato atual: ${definitionId}.`);
    }

    const nextCount = (counts.get(definitionId) ?? 0) + 1;
    counts.set(definitionId, nextCount);

    if (nextCount > rules.deck.maxCopiesPerDefinition) {
      errors.push(
        `${definitionId} excede o limite de ${rules.deck.maxCopiesPerDefinition} cópias.`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface RankedSortInput {
  playerId: string;
  wins: number;
  losses: number;
  distinctRankedOpponents: number;
  rankedCompletedMatches: number;
}

/**
 * Public ranking rule: win percentage first. Remaining fields only break true
 * ties; they must never override a higher win percentage.
 */
export function compareRankedProfiles(a: RankedSortInput, b: RankedSortInput): number {
  const aRate = computeWinRate(a);
  const bRate = computeWinRate(b);

  if (aRate !== bRate) return bRate - aRate;
  if (a.distinctRankedOpponents !== b.distinctRankedOpponents) {
    return b.distinctRankedOpponents - a.distinctRankedOpponents;
  }
  if (a.rankedCompletedMatches !== b.rankedCompletedMatches) {
    return b.rankedCompletedMatches - a.rankedCompletedMatches;
  }
  return a.playerId.localeCompare(b.playerId);
}
