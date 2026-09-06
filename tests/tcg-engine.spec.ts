import { expect, test } from "@playwright/test";
import { COLLECTION_001 } from "../src/tcg/cards/collection001";
import { auditRuntimeCoverage } from "../src/tcg/cards/runtime-audit";
import {
  attackLane,
  beginCombat,
  damageUnit,
  endTurn,
  playCommand,
  playControolz,
} from "../src/tcg/engine/duel";
import { createInitialMatchState, getPlayer } from "../src/tcg/engine/match";
import { DEFAULT_GAME_RULES } from "../src/tcg/rules";

const fillerA: readonly string[] = [
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
  "SET001-0093",
  "SET001-0097",
  "SET001-0098",
  "SET001-0117",
  "SET001-0121",
  "SET001-0126",
  "SET001-0131",
];

const fillerB: readonly string[] = [
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
  "SET001-0098",
  "SET001-0117",
  "SET001-0121",
  "SET001-0126",
  "SET001-0131",
  "SET001-0146",
  "SET001-0151",
  "SET001-0155",
  "SET001-0160",
  "SET001-0175",
];

function createMatch(
  playerADeck: readonly string[] = fillerA,
  playerBDeck: readonly string[] = fillerB,
) {
  return createInitialMatchState({
    matchId: "test-match",
    playerAId: "A",
    playerBId: "B",
    playerADeck,
    playerBDeck,
    firstPlayerId: "A",
    cardPoolVersion: "SET001-v1",
  });
}

test("Set 001 keeps exactly 200 cards and uses SINAL in runtime wording", () => {
  expect(COLLECTION_001).toHaveLength(200);
  for (const id of ["SET001-0086", "SET001-0119", "SET001-0141", "SET001-0181"]) {
    const card = COLLECTION_001.find((item) => item.id === id);
    expect(card).toBeTruthy();
    expect(card?.rulesText).toContain("SINAL");
    expect(card?.rulesText.toLocaleLowerCase("pt-BR")).not.toContain(" de vida");
  }
});

test("energy grows per Controller turn instead of global turn", () => {
  let state = createMatch();
  expect(getPlayer(state, "A").maxEnergy).toBe(1);
  expect(getPlayer(state, "B").maxEnergy).toBe(1);

  state = endTurn(state, "A");
  expect(state.activePlayerId).toBe("B");
  expect(getPlayer(state, "B").maxEnergy).toBe(1);

  state = endTurn(state, "B");
  expect(state.activePlayerId).toBe("A");
  expect(getPlayer(state, "A").maxEnergy).toBe(2);
});

test("combat is simultaneous and destroyed Controolz go to discard", () => {
  let state = createMatch();

  state = playControolz({
    state,
    playerId: "A",
    definitionId: "SET001-0001",
    lane: 0,
    catalogue: COLLECTION_001,
  }).state;
  state = endTurn(state, "A");

  state = playControolz({
    state,
    playerId: "B",
    definitionId: "SET001-0030",
    lane: 0,
    catalogue: COLLECTION_001,
  }).state;
  state = endTurn(state, "B");

  state = beginCombat(state, "A");
  state = attackLane({
    state,
    playerId: "A",
    lane: 0,
    catalogue: COLLECTION_001,
  }).state;

  expect(getPlayer(state, "A").board[0]).toBeNull();
  expect(getPlayer(state, "B").board[0]).toBeNull();
  expect(getPlayer(state, "A").discard).toContain("SET001-0001");
  expect(getPlayer(state, "B").discard).toContain("SET001-0030");
});

test("Biela Brava executes DESCONEXÃO and damages enemy SINAL", () => {
  const deckA = ["SET001-0006", ...fillerA.slice(0, 23)];
  let state = createMatch(deckA, fillerB);
  state = endTurn(state, "A");
  state = endTurn(state, "B");

  const played = playControolz({
    state,
    playerId: "A",
    definitionId: "SET001-0006",
    lane: 1,
    catalogue: COLLECTION_001,
  });
  state = played.state;
  const unit = getPlayer(state, "A").board[1];
  expect(unit).toBeTruthy();

  const destroyed = damageUnit(
    state,
    unit!.matchUnitId,
    3,
    COLLECTION_001,
  );
  expect(getPlayer(destroyed.state, "A").board[1]).toBeNull();
  expect(getPlayer(destroyed.state, "B").signal).toBe(19);
  expect(destroyed.pendingEffects).toHaveLength(0);
});

test("Troca Justa applies permanent +1/+1 through a structured Comando", () => {
  const rules = {
    ...DEFAULT_GAME_RULES,
    startingMaxEnergy: 2,
  };
  const deckA = ["SET001-0001", "SET001-0195", ...fillerA.slice(0, 22)];
  let state = createInitialMatchState({
    matchId: "buff-test",
    playerAId: "A",
    playerBId: "B",
    playerADeck: deckA,
    playerBDeck: fillerB,
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
  const unitId = getPlayer(state, "A").board[0]!.matchUnitId;

  const result = playCommand({
    state,
    playerId: "A",
    definitionId: "SET001-0195",
    catalogue: COLLECTION_001,
    targets: { ALLY_CONTROOLZ: [unitId] },
  });
  const buffed = getPlayer(result.state, "A").board[0]!;
  expect(buffed.attack).toBe(3);
  expect(buffed.maxDefense).toBe(2);
  expect(buffed.currentDefense).toBe(2);
  expect(getPlayer(result.state, "A").discard).toContain("SET001-0195");
  expect(result.pendingEffects).toHaveLength(0);
});

test("runtime audit exposes remaining text-only mechanics instead of guessing", () => {
  const report = auditRuntimeCoverage(COLLECTION_001);
  expect(report.totalCards).toBe(200);
  expect(report.fullyExecutableCards).toBeGreaterThan(0);
  expect(report.executableEffects).toBeGreaterThan(0);
  expect(report.issues.some((issue) => issue.reason === "TEXT_ONLY")).toBeTruthy();
});
