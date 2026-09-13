export type MarginStatus = 'ON_TRACK' | 'ADJUSTING' | 'EXCEEDED';

export interface MarginSimulatorInput {
  monthlyLimit: number;
  spentBeforeToday: number;
  spentToday: number;
  commitments: number;
  daysRemaining: number;
}

export interface MarginSimulatorResult {
  monthlyLimit: number;
  spentBeforeToday: number;
  spentToday: number;
  commitments: number;
  daysRemaining: number;
  initialDailyAllowance: number;
  todayAvailable: number;
  remainingMonthlyMargin: number;
  status: MarginStatus;
  percentageUsedToday: number;
}

export interface SimulatorPreset {
  id: string;
  label: string;
  monthlyLimit: number;
  spentBeforeToday: number;
  spentToday: number;
  commitments: number;
  daysRemaining: number;
}

export const SIMULATOR_PRESETS: readonly SimulatorPreset[] = [
  {
    id: 'preset-30k',
    label: 'RD$ 30,000',
    monthlyLimit: 30000,
    spentBeforeToday: 8000,
    spentToday: 400,
    commitments: 10000,
    daysRemaining: 12,
  },
  {
    id: 'preset-50k',
    label: 'RD$ 50,000',
    monthlyLimit: 50000,
    spentBeforeToday: 14000,
    spentToday: 850,
    commitments: 18000,
    daysRemaining: 12,
  },
  {
    id: 'preset-80k',
    label: 'RD$ 80,000',
    monthlyLimit: 80000,
    spentBeforeToday: 24000,
    spentToday: 1200,
    commitments: 30000,
    daysRemaining: 14,
  },
] as const;

export function calculateSimulatedMargin(input: MarginSimulatorInput): MarginSimulatorResult {
  const monthlyLimit = Math.max(0, input.monthlyLimit || 0);
  const spentBeforeToday = Math.max(0, input.spentBeforeToday || 0);
  const spentToday = Math.max(0, input.spentToday || 0);
  const commitments = Math.max(0, input.commitments || 0);
  const daysRemaining = Math.max(1, Math.floor(input.daysRemaining || 1));

  // Dinero disponible para los días restantes antes del gasto de hoy
  const poolBeforeToday = monthlyLimit - spentBeforeToday - commitments;
  const initialDailyAllowance = poolBeforeToday > 0 ? poolBeforeToday / daysRemaining : 0;

  // Margen que todavía se puede gastar hoy
  const todayAvailable = Math.max(0, initialDailyAllowance - spentToday);

  // Margen neto restante para todo el período
  const totalAllocated = spentBeforeToday + spentToday + commitments;
  const remainingMonthlyMargin = Math.max(0, monthlyLimit - totalAllocated);

  let status: MarginStatus = 'ON_TRACK';
  if (totalAllocated >= monthlyLimit || poolBeforeToday <= 0) {
    status = 'EXCEEDED';
  } else if (todayAvailable <= 0 || spentToday >= initialDailyAllowance) {
    status = 'ADJUSTING';
  }

  const percentageUsedToday = initialDailyAllowance > 0
    ? Math.min(100, Math.round((spentToday / initialDailyAllowance) * 100))
    : 100;

  return {
    monthlyLimit,
    spentBeforeToday,
    spentToday,
    commitments,
    daysRemaining,
    initialDailyAllowance: Math.round(initialDailyAllowance),
    todayAvailable: Math.round(todayAvailable),
    remainingMonthlyMargin: Math.round(remainingMonthlyMargin),
    status,
    percentageUsedToday,
  };
}
