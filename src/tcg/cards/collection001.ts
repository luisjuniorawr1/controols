import type { CardDefinition } from "../domain";
import { SET001_RAGE } from "./set001/rage";
import { SET001_LOGIC } from "./set001/logic";
import { SET001_WILD } from "./set001/wild";
import { SET001_GLITCH } from "./set001/glitch";
import { SET001_VOID } from "./set001/void";
import { SET001_PRIME } from "./set001/prime";
import { SET001_NEUTRAL } from "./set001/neutral";

export const COLLECTION_001_ID = "SET001" as const;
export const COLLECTION_001_EXPECTED_SIZE = 200 as const;

/**
 * Primeira coleção oficial do CONTROOLZ.
 *
 * Ordem preservada pelo número de coleção do documento oficial:
 * RAGE 1-29, LOGIC 30-58, WILD 59-87, GLITCH 88-116,
 * VOID 117-145, PRIME 146-174 e NEUTRAL 175-200.
 */
export const COLLECTION_001: readonly CardDefinition[] = [
  ...SET001_RAGE,
  ...SET001_LOGIC,
  ...SET001_WILD,
  ...SET001_GLITCH,
  ...SET001_VOID,
  ...SET001_PRIME,
  ...SET001_NEUTRAL,
];

export function getCollection001Card(id: string): CardDefinition | undefined {
  return COLLECTION_001.find((card) => card.id === id);
}
