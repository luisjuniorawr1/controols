import { expect, test } from "@playwright/test";
import { COLLECTION_001 } from "../src/tcg/cards/collection001";
import {
  attackLane,
  beginCombat,
  endTurn,
  playCommand,
  playControolz,
} from "../src/tcg/engine/duel";
import { createInitialMatchState, getPlayer } from "../src/tcg/engine/match";
import { getUnitModifiers } from "../src/tcg/engine/runtime-state";
import { getSet001EffectiveCost } from "../src/tcg/engine/set001-runtime";
import { DEFAULT_GAME_RULES } from "../src/tcg/rules";

const filler = [
  "SET001-0001",
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
  "SET001-0117",
  "SET001-0121",
  "SET001-0146",
  "SET001-0151",
  "SET001-0175",
  "SET001-0179",
  "SET001-0184",
] as const;

function matchWithEnergy(
  energy: number,
  deckA: readonly string[],
  deckB: readonly string[] = filler,
  firstPlayerId = "A",
) {
  const rules = { ...DEFAULT_GAME_RULES, startingMaxEnergy: energy };
  return {
    rules,
    state: createInitialMatchState({
      matchId: `hook-${energy}-${firstPlayerId}`,
      playerAId: "A",
      playerBId: "B",
      playerADeck: deckA,
      playerBDeck: deckB,
      firstPlayerId,
      cardPoolVersion: "SET001-v1",
      rules,
    }),
  };
}

test("Capim-Pedra can fight Controolz but cannot attack an open Controller lane", () => {
  const deckA = ["SET001-0063", ...filler.slice(0, 23)];
  const created = matchWithEnergy(2, deckA);
  let state = playControolz({
    state: created.state,
    playerId: "A",
    definitionId: "SET001-0063",
    lane: 0,
    catalogue: COLLECTION_001,
    rules: created.rules,
  }).state;

  state = endTurn(state, "A", created.rules, COLLECTION_001);
  state = endTurn(state, "B", created.rules, COLLECTION_001);
  state = beginCombat(state, "A");

  expect(() =>
    attackLane({
      state,
      playerId: "A",
      lane: 0,
      catalogue: COLLECTION_001,
      rules: created.rules,
    }),
  ).toThrow(/não pode atacar o Controller/i);
});

test("Robô do Protocolo 47-B discounts the first allied-target Command to minimum one", () => {
  const deckA = [
    "SET001-0153",
    "SET001-0146",
    "SET001-0169",
    ...filler.slice(0, 21),
  ];
  const created = matchWithEnergy(4, deckA);
  let state = playControolz({
    state: created.state,
    playerId: "A",
    definitionId: "SET001-0153",
    lane: 0,
    catalogue: COLLECTION_001,
    rules: created.rules,
  }).state;
  state = playControolz({
    state,
    playerId: "A",
    definitionId: "SET001-0146",
    lane: 1,
    catalogue: COLLECTION_001,
    rules: created.rules,
  }).state;

  const allyId = getPlayer(state, "A").board[1]!.matchUnitId;
  expect(getPlayer(state, "A").energy).toBe(1);

  const result = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0169",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [allyId] },
  });

  expect(getPlayer(result.state, "A").energy).toBe(0);
  expect(getPlayer(result.state, "A").discard).toContain("SET001-0169");
  expect(result.pendingEffects).toHaveLength(0);
});

test("Mascote Não Autorizado gains only one temporary DEF from stat changes each turn", () => {
  const deckA = [
    "SET001-0182",
    "SET001-0195",
    "SET001-0195",
    ...filler.slice(0, 21),
  ];
  const created = matchWithEnergy(4, deckA);
  let state = playControolz({
    state: created.state,
    playerId: "A",
    definitionId: "SET001-0182",
    lane: 0,
    catalogue: COLLECTION_001,
    rules: created.rules,
  }).state;
  const mascotId = getPlayer(state, "A").board[0]!.matchUnitId;

  state = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0195",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [mascotId] },
  }).state;
  state = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0195",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [mascotId] },
  }).state;

  const temporaryDefense = getUnitModifiers(state, mascotId).filter(
    (modifier) =>
      modifier.kind === "TEMP_DEFENSE" && modifier.sourceCardId === "SET001-0182",
  );
  expect(temporaryDefense).toHaveLength(1);
  expect(temporaryDefense[0]?.amount).toBe(1);
});

test("Tamanho P costs one while the opponent controls a cost six or seven Controolz", () => {
  const rules = { ...DEFAULT_GAME_RULES, startingMaxEnergy: 7 };
  const deckA = ["SET001-0194", ...filler.slice(0, 23)];
  const deckB = ["SET001-0020", ...filler.slice(0, 23)];
  let state = createInitialMatchState({
    matchId: "tamanho-p-cost",
    playerAId: "A",
    playerBId: "B",
    playerADeck: deckA,
    playerBDeck: deckB,
    firstPlayerId: "B",
    cardPoolVersion: "SET001-v1",
    rules,
  });
  const tamanhoP = COLLECTION_001.find((card) => card.id === "SET001-0194")!;

  expect(getSet001EffectiveCost(state, "A", tamanhoP, COLLECTION_001)).toBe(6);

  state = playControolz({
    state,
    playerId: "B",
    definitionId: "SET001-0020",
    lane: 0,
    catalogue: COLLECTION_001,
    rules,
  }).state;

  expect(getSet001EffectiveCost(state, "A", tamanhoP, COLLECTION_001)).toBe(1);
});
