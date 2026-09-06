import type { CardDefinition } from "../domain";

/**
 * Primeira coleção oficial do TCG.
 *
 * As cartas estão sendo produzidas em paralelo no processo de game design e
 * serão importadas aqui somente após passarem pela auditoria de balanceamento.
 */
export const COLLECTION_001: readonly CardDefinition[] = [];

export const COLLECTION_001_ID = "SET001" as const;
export const COLLECTION_001_EXPECTED_SIZE = 200 as const;

export function getCollection001Card(id: string): CardDefinition | undefined {
  return COLLECTION_001.find((card) => card.id === id);
}
