export type TourSection = 'home' | 'transactions' | 'analytics' | 'budget';
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
    title: 'Tu Margen Seguro Diario',
    description: 'Este número te dice cuánto puedes gastar hoy sin salirte de tu límite mensual ni olvidar tus compromisos.',
  },
  {
    section: 'home',
    target: 'recurring-radar',
    title: 'Tus compromisos ya están considerados',
    description: 'Los cobros que confirmes se reservan antes de calcular tu margen para que no gastes dinero que necesitarás después.',
  },
  {
    section: 'transactions',
    target: 'transactions',
    title: 'Tus movimientos mantienen el cálculo actualizado',
    description: 'Cuadre importa tus avisos bancarios y aquí puedes revisar o corregir cualquier movimiento que afecte tu margen.',
  },
] as const;
