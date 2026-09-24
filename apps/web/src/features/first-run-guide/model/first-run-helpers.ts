import type { GuideStep } from './first-run-types';

export const COMPLETED_STEPS_KEY = 'cuadre_guide_completed_steps_v1';
export const DISMISSED_KEY = 'cuadre_guide_dismissed_v1';
export const COLLAPSED_KEY = 'cuadre_guide_collapsed_v1';

export function readStoredSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function writeStoredSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // LocalStorage might be full or restricted
  }
}

export interface ComputeStepsParams {
  hasTransactions: boolean;
  hasConnection: boolean;
  hasBudget: boolean;
  interactedSteps: Set<string>;
}

export function computeGuideSteps({
  hasTransactions,
  hasConnection,
  hasBudget,
  interactedSteps,
}: ComputeStepsParams): GuideStep[] {
  const isStep1Done = hasTransactions || hasConnection || interactedSteps.has('connect_or_transact');
  const isStep2Done = interactedSteps.has('traffic_light');
  const isStep3Done = hasBudget || interactedSteps.has('budget_limit');
  const isStep4Done = interactedSteps.has('coro');

  return [
    {
      id: 'connect_or_transact',
      title: 'Conecta tu banco o registra un gasto',
      description: 'Sincroniza tus alertas bancarias de Gmail o anota tu primera compra para ver números reales.',
      actionLabel: hasConnection ? 'Registrar gasto' : 'Conectar banco',
      isCompleted: isStep1Done,
    },
    {
      id: 'traffic_light',
      title: 'Consulta el Semáforo de Tarjetas',
      description: 'Descubre cuál de tus tarjetas te da hasta 54 días de financiamiento a costo cero hoy.',
      actionLabel: '¿Con cuál pago hoy?',
      isCompleted: isStep2Done,
    },
    {
      id: 'budget_limit',
      title: 'Fija un límite en tu presupuesto',
      description: 'Ponle tope a categorías clave como comida, súper o entretenimiento para no descuadrarte.',
      actionLabel: 'Ver presupuesto',
      isCompleted: isStep3Done,
    },
    {
      id: 'coro',
      title: 'Conoce el Modo Coro',
      description: 'Divide cuentas de salidas, viajes y compras entre amigos sin calculadoras ni enredos.',
      actionLabel: 'Probar Modo Coro',
      isCompleted: isStep4Done,
    },
  ];
}

export function calculateGuideProgress(steps: GuideStep[]) {
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const allCompleted = totalSteps > 0 && completedCount === totalSteps;

  return {
    completedCount,
    totalSteps,
    progressPercent,
    allCompleted,
  };
}
