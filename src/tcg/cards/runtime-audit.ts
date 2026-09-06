import type { CardDefinition, EffectTrigger } from "../domain";

export interface RuntimeCoverageIssue {
  cardId: string;
  name: string;
  trigger: EffectTrigger;
  text: string;
  reason: "TEXT_ONLY" | "PASSIVE_NEEDS_SPECIFIC_TRIGGER";
  suggestedTrigger?: EffectTrigger;
}

export interface RuntimeCoverageReport {
  totalCards: number;
  cardsWithRules: number;
  vanillaCards: number;
  fullyExecutableCards: number;
  partiallyExecutableCards: number;
  textOnlyCards: number;
  totalEffects: number;
  executableEffects: number;
  issues: RuntimeCoverageIssue[];
}

function suggestSpecificTrigger(text: string): EffectTrigger | undefined {
  const normalized = text.toLocaleLowerCase("pt-BR");
  if (normalized.startsWith("ao atacar") || normalized.includes("quando atacar")) {
    return "ON_ATTACK";
  }
  if (normalized.startsWith("no início do seu turno")) return "TURN_START";
  if (normalized.startsWith("no fim do seu turno")) return "TURN_END";
  if (normalized.includes("sofrer dano") || normalized.includes("receber dano")) {
    return "ON_DAMAGE";
  }
  return undefined;
}

export function auditRuntimeCoverage(
  cards: readonly CardDefinition[],
): RuntimeCoverageReport {
  let cardsWithRules = 0;
  let vanillaCards = 0;
  let fullyExecutableCards = 0;
  let partiallyExecutableCards = 0;
  let textOnlyCards = 0;
  let totalEffects = 0;
  let executableEffects = 0;
  const issues: RuntimeCoverageIssue[] = [];

  for (const card of cards) {
    const effects = card.effects ?? [];
    const hasRules = Boolean(card.rulesText.trim());
    if (hasRules) cardsWithRules += 1;
    else vanillaCards += 1;

    if (!effects.length) {
      if (!hasRules) fullyExecutableCards += 1;
      else textOnlyCards += 1;
      continue;
    }

    totalEffects += effects.length;
    const executableCount = effects.filter(
      (effect) => effect.actions && effect.actions.length > 0,
    ).length;
    executableEffects += executableCount;

    if (executableCount === effects.length) fullyExecutableCards += 1;
    else if (executableCount > 0) partiallyExecutableCards += 1;
    else textOnlyCards += 1;

    for (const effect of effects) {
      if (!effect.actions?.length) {
        issues.push({
          cardId: card.id,
          name: card.name,
          trigger: effect.trigger,
          text: effect.text,
          reason: "TEXT_ONLY",
        });
      }
      if (effect.trigger === "PASSIVE") {
        const suggestedTrigger = suggestSpecificTrigger(effect.text);
        if (suggestedTrigger) {
          issues.push({
            cardId: card.id,
            name: card.name,
            trigger: effect.trigger,
            text: effect.text,
            reason: "PASSIVE_NEEDS_SPECIFIC_TRIGGER",
            suggestedTrigger,
          });
        }
      }
    }
  }

  return {
    totalCards: cards.length,
    cardsWithRules,
    vanillaCards,
    fullyExecutableCards,
    partiallyExecutableCards,
    textOnlyCards,
    totalEffects,
    executableEffects,
    issues,
  };
}

export function isCardRuntimeReady(card: CardDefinition): boolean {
  if (!card.rulesText.trim()) return true;
  const effects = card.effects ?? [];
  return (
    effects.length > 0 &&
    effects.every((effect) => Boolean(effect.actions?.length))
  );
}
