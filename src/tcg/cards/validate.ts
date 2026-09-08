import {
  CARD_CLASSES,
  CARD_RARITIES,
  CARD_TYPES,
  type CardDefinition,
} from "../domain";
import { DEFAULT_GAME_RULES, type GameRulesConfig } from "../rules";

export interface CatalogueValidationIssue {
  level: "ERROR" | "WARNING";
  cardId?: string;
  message: string;
}

export interface CatalogueValidationReport {
  valid: boolean;
  issues: CatalogueValidationIssue[];
  totals: {
    cards: number;
    controolz: number;
    commands: number;
    byClass: Record<string, number>;
    byRarity: Record<string, number>;
    byCost: Record<string, number>;
  };
}

export interface CatalogueValidationOptions {
  expectedSetId?: string;
  expectedSize?: number;
  rules?: GameRulesConfig;
}

function increment(record: Record<string, number>, key: string): void {
  record[key] = (record[key] ?? 0) + 1;
}

export function validateCatalogue(
  cards: readonly CardDefinition[],
  options: CatalogueValidationOptions = {},
): CatalogueValidationReport {
  const rules = options.rules ?? DEFAULT_GAME_RULES;
  const issues: CatalogueValidationIssue[] = [];
  const ids = new Set<string>();
  const collectorNumbers = new Set<string>();
  const byClass: Record<string, number> = {};
  const byRarity: Record<string, number> = {};
  const byCost: Record<string, number> = {};
  let controolz = 0;
  let commands = 0;

  if (
    options.expectedSize !== undefined &&
    cards.length !== options.expectedSize
  ) {
    issues.push({
      level: "ERROR",
      message: `Coleção deveria conter ${options.expectedSize} cartas, mas contém ${cards.length}.`,
    });
  }

  for (const card of cards) {
    const cardId = card.id;

    if (ids.has(cardId)) {
      issues.push({ level: "ERROR", cardId, message: "ID duplicado." });
    }
    ids.add(cardId);

    const collectorKey = `${card.setId}:${card.collectorNumber}`;
    if (collectorNumbers.has(collectorKey)) {
      issues.push({
        level: "ERROR",
        cardId,
        message: `Número de coleção duplicado: ${collectorKey}.`,
      });
    }
    collectorNumbers.add(collectorKey);

    if (options.expectedSetId && card.setId !== options.expectedSetId) {
      issues.push({
        level: "ERROR",
        cardId,
        message: `setId ${card.setId} difere do esperado ${options.expectedSetId}.`,
      });
    }

    if (!CARD_TYPES.includes(card.type)) {
      issues.push({ level: "ERROR", cardId, message: `Tipo inválido: ${card.type}.` });
    }

    if (!CARD_CLASSES.includes(card.cardClass)) {
      issues.push({
        level: "ERROR",
        cardId,
        message: `Classe inválida: ${card.cardClass}.`,
      });
    }

    if (!CARD_RARITIES.includes(card.rarity)) {
      issues.push({
        level: "ERROR",
        cardId,
        message: `Raridade inválida: ${card.rarity}.`,
      });
    }

    if (!Number.isInteger(card.cost) || card.cost < 1 || card.cost > rules.maxEnergy) {
      issues.push({
        level: "ERROR",
        cardId,
        message: `Custo ${card.cost} fora da faixa 1-${rules.maxEnergy}.`,
      });
    }

    if (!card.name.trim()) {
      issues.push({ level: "ERROR", cardId, message: "Carta sem nome." });
    }

    if (card.rulesText.length > 240) {
      issues.push({
        level: "WARNING",
        cardId,
        message: "Texto de regra passou de 240 caracteres; revisar legibilidade da carta.",
      });
    }

    if (card.type === "CONTROOLZ") {
      controolz += 1;
      if (!Number.isInteger(card.attack) || card.attack < 0) {
        issues.push({ level: "ERROR", cardId, message: "ATQ inválido." });
      }
      if (!Number.isInteger(card.defense) || card.defense <= 0) {
        issues.push({ level: "ERROR", cardId, message: "DEF precisa ser maior que zero." });
      }
    } else {
      commands += 1;
    }

    increment(byClass, card.cardClass);
    increment(byRarity, card.rarity);
    increment(byCost, String(card.cost));
  }

  const total = cards.length || 1;
  const commandShare = commands / total;
  if (cards.length > 0 && (commandShare < 0.2 || commandShare > 0.35)) {
    issues.push({
      level: "WARNING",
      message: `Comandos representam ${(commandShare * 100).toFixed(1)}% da coleção; alvo de design inicial é aproximadamente 25%-30%.`,
    });
  }

  for (const cardClass of CARD_CLASSES.filter((value) => value !== "NEUTRAL")) {
    if ((byClass[cardClass] ?? 0) === 0 && cards.length > 0) {
      issues.push({
        level: "WARNING",
        message: `A classe ${cardClass} não possui cartas no catálogo.`,
      });
    }
  }

  return {
    valid: !issues.some((issue) => issue.level === "ERROR"),
    issues,
    totals: {
      cards: cards.length,
      controolz,
      commands,
      byClass,
      byRarity,
      byCost,
    },
  };
}
