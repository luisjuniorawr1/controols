import type { CardDefinition } from "../../domain";

/**
 * Runtime-only tokens created by Set 001. They are not collectible definitions
 * and therefore do not count toward the 200-card collection size.
 */
export const SET001_TOKENS: readonly CardDefinition[] = [
  {
    id: "SET001-TOKEN-BROTINHO",
    setId: "SET001",
    collectorNumber: 0,
    name: "Brotinho",
    type: "CONTROOLZ",
    cardClass: "WILD",
    rarity: "COMMON",
    cost: 0,
    attack: 1,
    defense: 1,
    rulesText: "",
    archetypes: ["Token"],
    enabled: false,
  },
  {
    id: "SET001-TOKEN-ESPORO",
    setId: "SET001",
    collectorNumber: 0,
    name: "Esporo",
    type: "CONTROOLZ",
    cardClass: "WILD",
    rarity: "COMMON",
    cost: 0,
    attack: 0,
    defense: 2,
    rulesText: "",
    archetypes: ["Token"],
    enabled: false,
  },
];

export function getSet001TokenDefinition(id: string): CardDefinition | undefined {
  return SET001_TOKENS.find((token) => token.id === id);
}
