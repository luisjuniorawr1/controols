import { expect, test } from "@playwright/test";
import { COLLECTION_001 } from "../src/tcg/cards/collection001";
import { auditRuntimeCoverage } from "../src/tcg/cards/runtime-audit";

/**
 * Resolver-or-event-hook coverage lives in tcg-engine.spec.ts because a large
 * part of Set 001 is intentionally implemented by combat/stat/event hooks
 * rather than by a direct runtime resolver. This file protects the catalogue
 * invariants that must stay true as cards are edited.
 */
test("all 200 cards are structurally runtime-ready", () => {
  const report = auditRuntimeCoverage(COLLECTION_001);

  expect(report.totalCards).toBe(200);
  expect(report.textOnlyCards).toBe(0);
  expect(report.partiallyExecutableCards).toBe(0);
  expect(report.fullyExecutableCards).toBe(200);
  expect(report.executableEffects).toBe(report.totalEffects);
});

test("runtime ids are unique inside the official collection", () => {
  const ids = COLLECTION_001.flatMap((card) =>
    (card.effects ?? []).flatMap((effect) => (effect.runtimeId ? [effect.runtimeId] : [])),
  );
  expect(new Set(ids).size).toBe(ids.length);
});

test("every non-vanilla rules card has at least one explicit effect", () => {
  const invalid = COLLECTION_001.filter(
    (card) => Boolean(card.rulesText.trim()) && !(card.effects?.length),
  );
  expect(invalid.map((card) => `${card.id} ${card.name}`)).toEqual([]);
});

test("runtime catalogue no longer exposes player life as a mechanical resource", () => {
  const offending = COLLECTION_001.filter((card) =>
    /\bvida\b/i.test(card.rulesText) &&
    !/p[oó]s-vida|estouro de vida/i.test(card.name),
  );
  expect(offending.map((card) => `${card.id} ${card.name}`)).toEqual([]);
});
