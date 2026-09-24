import type { GuideStepId } from './first-run-types';

export type RecommendationType =
  | 'CONNECT_BANKS'
  | 'SET_MONTHLY_BUDGET'
  | 'CATEGORIZE_TRANSACTIONS'
  | 'CARD_TRAFFIC_LIGHT'
  | 'EXPLORE_CORO';

export interface StarterRecommendation {
  type: RecommendationType;
  stepNumber: number;
  badge: string;
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  targetStepId: GuideStepId;
}

export interface RecommendationContext {
  hasTransactions: boolean;
  hasConnection: boolean;
  hasBudget: boolean;
  hasUncategorized?: boolean;
  interactedSteps: Set<string>;
}

export function getStarterRecommendation({
  hasTransactions,
  hasConnection,
  hasBudget,
  hasUncategorized = false,
  interactedSteps,
}: RecommendationContext): StarterRecommendation {
  // Priority 1: No data yet
  if (!hasTransactions && !hasConnection) {
    return {
      type: 'CONNECT_BANKS',
      stepNumber: 1,
      badge: '👉 PASO 1 RECOMENDADO',
      title: 'Trae tus primeros movimientos',
      description:
        'Para que tu Margen Seguro cobre vida, conecta tus bancos por Gmail o anota tu primera compra a mano.',
      primaryActionLabel: 'Conectar bancos por Gmail',
      secondaryActionLabel: '+ Anotar gasto a mano',
      targetStepId: 'connect_or_transact',
    };
  }

  // Priority 2: Data exists, but no budget
  if (!hasBudget && !interactedSteps.has('budget_limit')) {
    return {
      type: 'SET_MONTHLY_BUDGET',
      stepNumber: 2,
      badge: '👉 PASO 2 RECOMENDADO',
      title: 'Fija tu límite de gasto mensual',
      description:
        'Tus movimientos ya están aquí. Define cuánto quieres gastar este mes para que tu Margen Seguro Diario empiece a proteger tu quincena.',
      primaryActionLabel: 'Fijar límite en Presupuesto',
      targetStepId: 'budget_limit',
    };
  }

  // Priority 3: Transactions need categorization
  if (hasUncategorized) {
    return {
      type: 'CATEGORIZE_TRANSACTIONS',
      stepNumber: 3,
      badge: '👉 PASO 3 RECOMENDADO',
      title: 'Clasifica tus gastos pendientes',
      description:
        'Tienes movimientos recientes sin categoría. Clasifícalos para que tus límites por rubro sean 100% exactos.',
      primaryActionLabel: 'Clasificar movimientos',
      targetStepId: 'connect_or_transact',
    };
  }

  // Priority 4: Traffic light (superpower)
  if (!interactedSteps.has('traffic_light')) {
    return {
      type: 'CARD_TRAFFIC_LIGHT',
      stepNumber: 4,
      badge: '⚡ SUPERPODER FINANCIERO',
      title: '¿Con cuál tarjeta pagar hoy?',
      description:
        'Consulta el Semáforo inteligente para saber cuál de tus plásticos te da hasta 54 días de financiamiento a costo cero.',
      primaryActionLabel: 'Consultar recomendación',
      targetStepId: 'traffic_light',
    };
  }

  // Priority 5: Social Coro
  return {
    type: 'EXPLORE_CORO',
    stepNumber: 5,
    badge: '👥 MODO CORO',
    title: 'Divide tus salidas sin calculadoras',
    description:
      '¿Tienes planes con amigos o compras compartidas? El Modo Coro calcula las transferencias mínimas por banco.',
    primaryActionLabel: 'Probar Modo Coro',
    targetStepId: 'coro',
  };
}
