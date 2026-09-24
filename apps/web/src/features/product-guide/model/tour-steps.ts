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
    title: 'Tu Margen Seguro Diario',
    description:
      'El corazón de Cuadre. Te dice exactamente cuánto dinero libre tienes para gastar hoy sin descuadrar tu presupuesto ni tus compromisos.',
  },
  {
    section: 'home',
    target: 'quick-actions',
    title: 'Acciones Rápidas & Superpoderes',
    description:
      'Accede al Semáforo de tarjetas (hasta 54 días a costo cero), Modo Coro, Cuadre del Mes o simula un gasto antes de comprar.',
  },
  {
    section: 'home',
    target: 'connection-health',
    title: 'Tus movimientos al día',
    description:
      'Cuadre procesa las alertas de tus bancos dominicanos (Banreservas, Popular, BHD, Qik, etc.) de forma 100% segura y automática.',
  },
  {
    section: 'transactions',
    target: 'transactions',
    title: 'Tus Movimientos Unificados',
    description:
      'Consulta todos tus gastos e ingresos en RD$ y USD, organiza tus categorías y crea reglas automáticas.',
  },
  {
    section: 'transactions',
    target: 'new-movement',
    title: 'Registra en segundos',
    description:
      '¿Pagaste en efectivo o con un método no conectado? Añade un gasto o ingreso manual rápidamente con este botón.',
  },
] as const;
