import type { CardRecommendationStatus } from '@bills/contracts';

export interface TrafficLightMeta {
  status: CardRecommendationStatus;
  label: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
  description: string;
}

export const TRAFFIC_LIGHT_META: Record<CardRecommendationStatus, TrafficLightMeta> = {
  EXCELLENT: {
    status: 'EXCELLENT',
    label: '🟢 RECOMENDADA HOY',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/5',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    description: '40 a 54 días de financiamiento sin intereses.',
  },
  GOOD: {
    status: 'GOOD',
    label: '🟡 NEUTRA / INTERMEDIA',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/5',
    textClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    description: '25 a 39 días de financiamiento disponible.',
  },
  AVOID_CUT_IMMINENT: {
    status: 'AVOID_CUT_IMMINENT',
    label: '🔴 NO USAR HOY',
    badgeClass: 'bg-destructive/15 text-destructive border-destructive/20',
    borderClass: 'border-destructive/30',
    bgClass: 'bg-destructive/5',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
    description: 'Corte inminente (1 a 3 días) o financiamiento reducido.',
  },
};

export function getTrafficLightMeta(status: CardRecommendationStatus): TrafficLightMeta {
  return TRAFFIC_LIGHT_META[status] ?? TRAFFIC_LIGHT_META.GOOD;
}

import { formatDayDate } from '@/shared/lib';

export { formatDayDate as formatShortDate };

export const ANTI_FINANCING_INFO = {
  title: 'Alerta Anti-Financiamiento en RD',
  statRate: '50% - 60% anual',
  message:
    'Las tarjetas de crédito en República Dominicana cobran entre un 50% y 60% anual de interés por financiamiento rotativo. Para aprovechar los días a costo cero, paga siempre el TOTAL del corte y jamás el pago mínimo.',
};
