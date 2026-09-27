export type OnboardingVisualType =
  | 'pay_yourself_first'
  | 'transfers_not_expenses'
  | 'daily_margin'
  | 'superpowers';

export interface OnboardingHookSlide {
  id: string;
  badge: string;
  title: string;
  explanation: string;
  visualType: OnboardingVisualType;
  highlightMetric?: string;
  metricLabel?: string;
}

export const ONBOARDING_HOOK_SLIDES: readonly OnboardingHookSlide[] = [
  {
    id: 'pay-yourself-first',
    badge: 'Regla #1 de Cuadre',
    title: 'Guarda lo tuyo antes de pagarle al mundo',
    explanation:
      'Cobras tu quincena y apartas tu ahorro primero. Ese dinero queda protegido y nadie lo toca.',
    visualType: 'pay_yourself_first',
  },
  {
    id: 'transfers-not-expenses',
    badge: 'Sin sorpresas',
    title: 'Mover dinero a tu ahorro no te castiga',
    explanation:
      'Al pasar dinero a tu cuenta de ahorro o entre tus bancos, Cuadre lo reconoce como ahorro, no como gasto. Tu margen diario se mantiene intacto.',
    visualType: 'transfers_not_expenses',
  },
  {
    id: 'daily-margin',
    badge: 'El Piloto Automático',
    title: 'Un número claro por día para gastar tranquilo',
    explanation:
      'Olvida los presupuestos rígidos de Excel. Cuadre te dice exactamente cuánto puedes gastar hoy en lo que quieras (comida, salidas, gustitos) sin descuadrarte.',
    visualType: 'daily_margin',
    highlightMetric: '≈ RD$ 1,150',
    metricLabel: 'por día libre para ti',
  },
  {
    id: 'superpowers',
    badge: 'Hecho para dominicanos',
    title: 'Semáforo de tarjetas y Ritual de quincena',
    explanation:
      'Sabrás con cuál tarjeta pagar hoy para ganar hasta 54 días de financiamiento a 0% de interés, y te avisamos en tus fechas de cobro (15 y 30 o 14 y 29).',
    visualType: 'superpowers',
  },
];

export function clampSlideIndex(index: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0;
  return Math.max(0, Math.min(index, totalSlides - 1));
}

export function detectSwipeDirection(
  startX: number | null,
  endX: number | null,
  threshold = 50,
): 'next' | 'prev' | null {
  if (startX === null || endX === null) return null;
  const diff = startX - endX;
  if (diff > threshold) return 'next';
  if (diff < -threshold) return 'prev';
  return null;
}
