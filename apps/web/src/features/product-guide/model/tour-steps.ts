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
    target: 'connection-health',
    title: 'Tus movimientos mantienen el margen actualizado',
    description: 'Aquí puedes comprobar si Gmail está conectado, sincronizando o necesita tu atención. También puedes usar Cuadre manualmente.',
  },
  {
    section: 'transactions',
    target: 'transactions',
    title: 'Revisa los movimientos que forman el cálculo',
    description: 'Aquí puedes verificar y corregir cualquier movimiento. Los cobros fijos confirmados ya se reservan dentro de tu Margen Seguro.',
  },
] as const;
