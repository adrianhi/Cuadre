export type TourSection = 'home' | 'transactions' | 'control' | 'hub' | 'analytics' | 'budget';
export type TourDirection = 'forward' | 'backward';
export type TourPhase = 'exiting' | 'navigating' | 'locating' | 'scrolling' | 'settled';

export interface TourStep {
  section: TourSection;
  target: string;
  title: string;
  description: string;
}

export const PRODUCT_TOUR_STEPS: readonly TourStep[] = [
  {
    section: 'home',
    target: 'safe-to-spend',
    title: 'Tu Margen de Hoy (El Dial)',
    description: 'Tu guía diaria real para gastar libremente sin culpa.',
  },
  {
    section: 'home',
    target: 'starter-hero',
    title: 'Tu Ahorro Blindado & Quincena',
    description: 'Apartas tu ahorro primero y tus transferencias nunca se descuentan como gastos.',
  },
  {
    section: 'home',
    target: 'quick-action-rail',
    title: 'Tus Superpoderes',
    description: 'Consulta el Semáforo de Tarjetas para financiarte a costo cero y simula gastos.',
  },
  {
    section: 'transactions',
    target: 'transactions',
    title: 'Tus Movimientos al día',
    description: 'Se actualizan automáticamente con tus bancos compatibles.',
  },
] as const;
