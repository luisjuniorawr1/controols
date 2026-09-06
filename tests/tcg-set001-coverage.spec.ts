import { expect, test } from "@playwright/test";
import { COLLECTION_001 } from "../src/tcg/cards/collection001";
import { auditRuntimeCoverage } from "../src/tcg/cards/runtime-audit";
import { createInitialMatchState } from "../src/tcg/engine/match";
import {
  resolveSet001RuntimeEffect,
  type Set001RuntimeCallbacks,
} from "../src/tcg/engine/set001-runtime";
import { resolveSet001RuntimeEffectAll } from "../src/tcg/engine/set001-runtime-extra";

const filler = COLLECTION_001.slice(0, 24).map((card) => card.id);

function baseState() {
  return createInitialMatchState({
    matchId: "set001-runtime-coverage",
    playerAId: "A",
    playerBId: "B",
    playerADeck: filler,
    playerBDeck: [...filler].reverse(),
    firstPlayerId: "A",
    cardPoolVersion: "SET001-v1",
  });
}

function inertCallbacks(): Set001RuntimeCallbacks {
  return {
    damageUnit: (state) => ({ state, pendingEffects: [] }),
    disconnectUnit: (state) => ({ state, pendingEffects: [] }),
    resolveConnection: (state) => ({ state, pendingEffects: [] }),
  };
}

test("all 200 cards are structurally runtime-ready", () => {
  const report = auditRuntimeCoverage(COLLECTION_001);

  expect(report.totalCards).toBe(200);
  expect(report.textOnlyCards).toBe(0);
  expect(report.partiallyExecutableCards).toBe(0);
  expect(report.fullyExecutableCards).toBe(200);
  expect(report.executableEffects).toBe(report.totalEffects);
});

test("every delegated Set 001 runtime id has a concrete resolver", () => {
  const unresolved: string[] = [];
  const thrown: string[] = [];
  const callbacks = inertCallbacks();

  for (const card of COLLECTION_001) {
    for (const effect of card.effects ?? []) {
      if (!effect.runtimeId || effect.actions?.length) continue;

      const state = baseState();
      try {
        const context = { sourcePlayerId: "A" } as const;
        const core = resolveSet001RuntimeEffect(
          state,
          effect.runtimeId,
          effect.text,
          effect.trigger,
          COLLECTION_001,
          context,
          callbacks,
        );
        const resolved = resolveSet001RuntimeEffectAll(
          core,
          state,
          effect.runtimeId,
          effect.text,
          effect.trigger,
          COLLECTION_001,
          context,
          callbacks,
        );

        const fellThrough = resolved.pendingEffects.some(
          (pending) =>
            pending.reason === "UNSUPPORTED_ACTION" &&
            pending.decisionKey === `runtime:${effect.runtimeId}`,
        );
        if (fellThrough) unresolved.push(`${effect.runtimeId} ${card.name}`);
      } catch (error) {
        thrown.push(
          `${effect.runtimeId} ${card.name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  expect(thrown, `Resolvers que lançaram erro sem alvos/escolhas: ${thrown.join(" | ")}`).toEqual([]);
  expect(unresolved, `Runtime ids sem implementação: ${unresolved.join(" | ")}`).toEqual([]);
});

test("runtime ids are unique inside the official collection", () => {
  const ids = COLLECTION_001.flatMap((card) =>
    (card.effects ?? []).flatMap((effect) => (effect.runtimeId ? [effect.runtimeId] : [])),
  );
  expect(new Set(ids).size).toBe(ids.length);
});

test("runtime catalogue no longer exposes player life as a mechanical resource", () => {
  const offending = COLLECTION_001.filter((card) =>
    /\bvida\b/i.test(card.rulesText) &&
    !/p[oó]s-vida|estouro de vida/i.test(card.name),
  );
  expect(offending.map((card) => `${card.id} ${card.name}`)).toEqual([]);
});
