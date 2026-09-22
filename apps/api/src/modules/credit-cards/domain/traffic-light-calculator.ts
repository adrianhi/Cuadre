import type { CardRecommendation, CardRecommendationStatus } from '@bills/contracts';
import type { CreditCardData } from './credit-card';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getClosingDate(year: number, month: number, closingDay: number): Date {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(closingDay, daysInMonth);
  return new Date(Date.UTC(year, month, day));
}

export function evaluateCardFinancing(
  card: CreditCardData,
  today: Date = new Date(),
): CardRecommendation {
  const todayMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const year = todayMidnight.getUTCFullYear();
  const month = todayMidnight.getUTCMonth();

  const currentMonthClosing = getClosingDate(year, month, card.closingDay);

  let lastClosingDate: Date;
  let nextClosingDate: Date;

  if (todayMidnight.getTime() > currentMonthClosing.getTime()) {
    lastClosingDate = currentMonthClosing;
    nextClosingDate = getClosingDate(year, month + 1, card.closingDay);
  } else {
    lastClosingDate = getClosingDate(year, month - 1, card.closingDay);
    nextClosingDate = currentMonthClosing;
  }

  const graceDays = card.graceDays ?? 22;
  const dueDate = new Date(nextClosingDate.getTime() + graceDays * MS_PER_DAY);

  const freeFinancingDays = Math.round((dueDate.getTime() - todayMidnight.getTime()) / MS_PER_DAY);
  const daysUntilNextClosing = Math.round((nextClosingDate.getTime() - todayMidnight.getTime()) / MS_PER_DAY);
  const daysSinceLastClosing = Math.round((todayMidnight.getTime() - lastClosingDate.getTime()) / MS_PER_DAY);

  let status: CardRecommendationStatus;
  let reason: string;

  if (freeFinancingDays < 25 || daysUntilNextClosing <= 3) {
    status = 'AVOID_CUT_IMMINENT';
    if (daysUntilNextClosing === 0) {
      reason = `¡El corte es hoy! Si compras hoy, entrará en este corte y pagarás en ${freeFinancingDays} días. Mejor espera a mañana.`;
    } else if (daysUntilNextClosing === 1) {
      reason = `¡Corte inminente mañana! Tienes solo ${freeFinancingDays} días de financiamiento. Espera que pase el corte para maximizar tu plazo.`;
    } else if (daysUntilNextClosing <= 3) {
      reason = `¡Corte inminente en ${daysUntilNextClosing} días! Si compras hoy, tendrás solo ${freeFinancingDays} días de financiamiento. Te conviene esperar al corte.`;
    } else {
      reason = `Faltan ${daysUntilNextClosing} días para el corte. Tienes solo ${freeFinancingDays} días de financiamiento.`;
    }
  } else if (freeFinancingDays >= 40) {
    status = 'EXCELLENT';
    if (daysSinceLastClosing === 1) {
      reason = `Cortó ayer. Tienes ${freeFinancingDays} días de financiamiento a tasa 0%.`;
    } else if (daysSinceLastClosing > 1) {
      reason = `Cortó hace ${daysSinceLastClosing} días. Tienes ${freeFinancingDays} días de financiamiento a tasa 0%.`;
    } else {
      reason = `Corte recién cerrado. Tienes ${freeFinancingDays} días de financiamiento a tasa 0%.`;
    }
  } else {
    status = 'GOOD';
    reason = `Faltan ${daysUntilNextClosing} días para el corte. Tienes ${freeFinancingDays} días de financiamiento disponible.`;
  }

  return {
    card: {
      id: card.id,
      workspaceId: card.workspaceId,
      institutionCode: card.institutionCode,
      alias: card.alias,
      cardLast4: card.cardLast4,
      cardType: card.cardType,
      closingDay: card.closingDay,
      graceDays: card.graceDays,
      isDefault: card.isDefault,
      colorTheme: card.colorTheme ?? null,
      notes: card.notes ?? null,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    },
    freeFinancingDays,
    status,
    nextClosingDate: nextClosingDate.toISOString(),
    dueDate: dueDate.toISOString(),
    reason,
  };
}

export function sortCardRecommendations(recommendations: CardRecommendation[]): CardRecommendation[] {
  return [...recommendations].sort((a, b) => {
    if (b.freeFinancingDays !== a.freeFinancingDays) {
      return b.freeFinancingDays - a.freeFinancingDays;
    }
    if (a.card.isDefault && !b.card.isDefault) return -1;
    if (!a.card.isDefault && b.card.isDefault) return 1;
    return a.card.alias.localeCompare(b.card.alias);
  });
}

export function findBestCardForToday(
  cards: CreditCardData[],
  today: Date = new Date(),
): CardRecommendation | null {
  if (cards.length === 0) return null;
  const recommendations = cards.map((card) => evaluateCardFinancing(card, today));
  const sorted = sortCardRecommendations(recommendations);
  return sorted[0] ?? null;
}
