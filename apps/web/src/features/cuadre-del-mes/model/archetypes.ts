export type ArchetypeId =
  | 'EL_ESTRATEGA'
  | 'EL_ALMA_DEL_CORO'
  | 'EL_HOGARENO'
  | 'EL_ZEN'
  | 'EL_EXPLORADOR'
  | 'EL_CUADRADOR';

export interface FinancialArchetype {
  id: ArchetypeId;
  name: string;
  emoji: string;
  badge: string;
  description: string;
  quote: string;
  accentColor: string;
  badgeVariant: 'emerald' | 'amber' | 'blue' | 'purple' | 'cyan' | 'primary';
}

export const FINANCIAL_ARCHETYPES: Record<ArchetypeId, FinancialArchetype> = {
  EL_ESTRATEGA: {
    id: 'EL_ESTRATEGA',
    name: 'El Estratega 📈',
    emoji: '📈',
    badge: 'Ahorro Pro',
    description: 'Guardaste más del 25% de tus ingresos este mes. Tu disciplina financiera está a nivel de Grandes Ligas.',
    quote: 'Ahorrando callao para dar el palo después.',
    accentColor: '#10b981',
    badgeVariant: 'emerald',
  },
  EL_ALMA_DEL_CORO: {
    id: 'EL_ALMA_DEL_CORO',
    name: 'El Alma del Coro 🍕',
    emoji: '🍕',
    badge: 'Vida Social Activa',
    description: 'Más del 35% de tus consumos fueron en restaurantes, comida y entretenimiento. ¡La chercha no se negocia!',
    quote: 'La comida fría y el coro caliente; los cuartos van y vienen pero la risa se queda.',
    accentColor: '#f59e0b',
    badgeVariant: 'amber',
  },
  EL_HOGARENO: {
    id: 'EL_HOGARENO',
    name: 'Amo/a de Casa Pro 🛒',
    emoji: '🛒',
    badge: 'Despensa Lista',
    description: 'Tu templo es el hogar. Más del 35% de tu presupuesto fue a supermercado y compras para la casa.',
    quote: 'Nevera llena, corazón contento y el carrito del súper bien optimizado.',
    accentColor: '#3b82f6',
    badgeVariant: 'blue',
  },
  EL_ZEN: {
    id: 'EL_ZEN',
    name: 'El Maestro Zen 🧘',
    emoji: '🧘',
    badge: 'Paz Mental',
    description: 'Pocos movimientos y control milimétrico. Cero compras impulsivas y casi todo el mes bajo control.',
    quote: 'Respira hondo: quien compra solo lo necesario no le teme al fin de mes.',
    accentColor: '#8b5cf6',
    badgeVariant: 'purple',
  },
  EL_EXPLORADOR: {
    id: 'EL_EXPLORADOR',
    name: 'El Explorador 🧭',
    emoji: '🧭',
    badge: 'Curiosidad Total',
    description: 'No te casas con un solo lugar. Visitaste una gran variedad de comercios diferentes durante el mes.',
    quote: 'No hay comercio en la ciudad que escape a mi radar de tarjetas.',
    accentColor: '#06b6d4',
    badgeVariant: 'cyan',
  },
  EL_CUADRADOR: {
    id: 'EL_CUADRADOR',
    name: 'El Cuadrador Imparable 🎯',
    emoji: '🎯',
    badge: 'Balance Equilibrado',
    description: 'Distribución armónica en tus gastos. Mantuviste el control de tus cuentas sin privarte de tus gustos.',
    quote: 'Ni tacaño ni botarate: el verdadero equilibrio financiero dominicano.',
    accentColor: '#10b981',
    badgeVariant: 'primary',
  },
};
