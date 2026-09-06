import type { CardDefinition, CardEffect } from "../../domain";

/**
 * The source files in this folder mirror the approved design document. Runtime
 * normalization lives here so terminology/mechanics can evolve without losing
 * the imported source wording.
 */

const RULE_TEXT_OVERRIDES: Readonly<Record<string, string>> = {
  "SET001-0086": "Seu Controller recupera 5 de SINAL e cada aliado recupera 2 DEF.",
  "SET001-0119": "DESCONEXÃO — Seu Controller recupera 1 de SINAL.",
  "SET001-0141":
    "Compre duas cartas e depois descarte uma. Se descartou um Controolz, seu Controller recupera 1 de SINAL.",
  "SET001-0181":
    "DESCONEXÃO — Se seu Controller tiver menos SINAL que o adversário, ele recupera 2 de SINAL.",
};

const EFFECTS_OVERRIDES: Readonly<Record<string, readonly CardEffect[]>> = {
  "SET001-0006": [
    {
      trigger: "DISCONNECTION",
      text: "Cause 1 de dano ao Controller inimigo.",
      actions: [{ type: "CHANGE_SIGNAL", amount: -1, player: "OPPONENT" }],
    },
  ],
  "SET001-0008": [
    {
      trigger: "DISCONNECTION",
      text: "Cause 1 de dano ao seu Controller.",
      actions: [{ type: "CHANGE_SIGNAL", amount: -1, player: "SELF" }],
    },
  ],
  "SET001-0020": [
    {
      trigger: "CONNECTION",
      text: "Cause 2 de dano a todos os outros Controolz.",
      actions: [{ type: "DEAL_DAMAGE", amount: 2, target: "ALL_OTHER_CONTROOLZ" }],
    },
  ],
  "SET001-0070": [
    {
      trigger: "CONNECTION",
      text: "Cada aliado recupera 1 DEF.",
      actions: [{ type: "RESTORE_DEFENSE", amount: 1, target: "ALL_ALLY_CONTROOLZ" }],
    },
  ],
  "SET001-0081": [
    {
      trigger: "COMMAND_RESOLVE",
      text: "Um aliado recebe +2 DEF permanente.",
      actions: [
        {
          type: "MODIFY_DEFENSE",
          amount: 2,
          target: "ALLY_CONTROOLZ",
          duration: "PERMANENT",
        },
      ],
    },
  ],
  "SET001-0086": [
    {
      trigger: "COMMAND_RESOLVE",
      text: "Seu Controller recupera 5 de SINAL e cada aliado recupera 2 DEF.",
      actions: [
        { type: "CHANGE_SIGNAL", amount: 5, player: "SELF" },
        { type: "RESTORE_DEFENSE", amount: 2, target: "ALL_ALLY_CONTROOLZ" },
      ],
    },
  ],
  "SET001-0119": [
    {
      trigger: "DISCONNECTION",
      text: "Seu Controller recupera 1 de SINAL.",
      actions: [{ type: "CHANGE_SIGNAL", amount: 1, player: "SELF" }],
    },
  ],
  "SET001-0123": [
    {
      trigger: "DISCONNECTION",
      text: "Cause 1 de dano a um Controolz.",
      actions: [{ type: "DEAL_DAMAGE", amount: 1, target: "ANY_CONTROOLZ" }],
    },
  ],
  "SET001-0138": [
    {
      trigger: "COMMAND_RESOLVE",
      text: "Destrua um Controolz aliado. Compre uma carta.",
      actions: [
        { type: "DESTROY", target: "ALLY_CONTROOLZ" },
        { type: "DRAW", amount: 1, player: "SELF" },
      ],
    },
  ],
  "SET001-0148": [
    {
      trigger: "DISCONNECTION",
      text: "Outro aliado recebe +1 DEF permanente.",
      actions: [
        {
          type: "MODIFY_DEFENSE",
          amount: 1,
          target: "OTHER_ALLY_CONTROOLZ",
          duration: "PERMANENT",
        },
      ],
    },
  ],
  "SET001-0157": [
    {
      trigger: "CONNECTION",
      text: "Outro aliado recebe +2 DEF permanente.",
      actions: [
        {
          type: "MODIFY_DEFENSE",
          amount: 2,
          target: "OTHER_ALLY_CONTROOLZ",
          duration: "PERMANENT",
        },
      ],
    },
  ],
  "SET001-0195": [
    {
      trigger: "COMMAND_RESOLVE",
      text: "Um aliado recebe +1 ATQ e +1 DEF permanentes.",
      actions: [
        {
          type: "MODIFY_ATTACK",
          amount: 1,
          target: "ALLY_CONTROOLZ",
          duration: "PERMANENT",
        },
        {
          type: "MODIFY_DEFENSE",
          amount: 1,
          target: "ALLY_CONTROOLZ",
          duration: "PERMANENT",
        },
      ],
    },
  ],
};

function normalizeEffectText(cardId: string, effect: CardEffect): CardEffect {
  if (!RULE_TEXT_OVERRIDES[cardId]) return effect;
  return {
    ...effect,
    text: effect.text
      .replaceAll("menos vida", "menos SINAL")
      .replaceAll(" de vida", " de SINAL"),
  };
}

export function prepareSet001CardForRuntime(card: CardDefinition): CardDefinition {
  const overriddenEffects = EFFECTS_OVERRIDES[card.id];
  const effects = overriddenEffects
    ? overriddenEffects
    : card.effects?.map((effect) => normalizeEffectText(card.id, effect));

  return {
    ...card,
    rulesText: RULE_TEXT_OVERRIDES[card.id] ?? card.rulesText,
    effects,
  } as CardDefinition;
}

export function hasExecutableEffects(card: CardDefinition): boolean {
  return Boolean(
    card.effects?.some((effect) => effect.actions && effect.actions.length > 0),
  );
}
