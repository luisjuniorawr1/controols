import { expect, test } from "@playwright/test";
import { COLLECTION_001 } from "../src/tcg/cards/collection001";
import { playCommand, playControolz } from "../src/tcg/engine/duel";
import { createInitialMatchState, getPlayer } from "../src/tcg/engine/match";
import { getUnitModifiers } from "../src/tcg/engine/runtime-state";
import { DEFAULT_GAME_RULES } from "../src/tcg/rules";

const filler = [
  "SET001-0005",
  "SET001-0010",
  "SET001-0012",
  "SET001-0015",
  "SET001-0030",
  "SET001-0034",
  "SET001-0039",
  "SET001-0040",
  "SET001-0044",
  "SET001-0059",
  "SET001-0064",
  "SET001-0068",
  "SET001-0069",
  "SET001-0073",
  "SET001-0088",
  "SET001-0092",
  "SET001-0093",
  "SET001-0097",
  "SET001-0117",
  "SET001-0121",
  "SET001-0146",
  "SET001-0151",
  "SET001-0175",
  "SET001-0179",
] as const;

test("Copiar e Colar exiles the original low-cost Command and executes its copy", () => {
  const rules = { ...DEFAULT_GAME_RULES, startingMaxEnergy: 5 };
  const deckA = [
    "SET001-0001",
    "SET001-0109",
    "SET001-0113",
    ...filler.slice(0, 21),
  ];
  let state = createInitialMatchState({
    matchId: "copy-paste-runtime",
    playerAId: "A",
    playerBId: "B",
    playerADeck: deckA,
    playerBDeck: filler,
    firstPlayerId: "A",
    cardPoolVersion: "SET001-v1",
    rules,
  });

  state = playControolz({
    state,
    playerId: "A",
    definitionId: "SET001-0001",
    lane: 0,
    catalogue: COLLECTION_001,
    rules,
  }).state;
  const allyId = getPlayer(state, "A").board[0]!.matchUnitId;

  state = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0109",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [allyId] },
  }).state;
  expect(getPlayer(state, "A").discard).toContain("SET001-0109");
  expect(
    getUnitModifiers(state, allyId).filter((modifier) => modifier.kind === "SWAP_STATS"),
  ).toHaveLength(1);

  const result = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0113",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [allyId] },
    choices: { cards: { copyCommand: ["SET001-0109"] } },
  });
  state = result.state;

  expect(result.pendingEffects).toHaveLength(0);
  expect(getPlayer(state, "A").discard).toContain("SET001-0113");
  expect(getPlayer(state, "A").discard).not.toContain("SET001-0109");
  expect(state.runtime?.exileByPlayer.A).toContain("SET001-0109");
  expect(
    getUnitModifiers(state, allyId).filter((modifier) => modifier.kind === "SWAP_STATS"),
  ).toHaveLength(2);
});
