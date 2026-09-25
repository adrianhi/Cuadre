import type { IncomeFrequency } from '@bills/contracts';

export type PaydayPreset = '15_30' | '14_29' | '10_25' | 'custom';

export function calculateMonthlyIncome(amount: number, frequency: IncomeFrequency): number {
  if (amount <= 0) return 0;
  if (frequency === 'BIWEEKLY_15_30') return amount * 2;
  if (frequency === 'WEEKLY') return (amount * 52) / 12;
  return amount;
}

export function calculateMonthlySavings(amount: number, frequency: IncomeFrequency): number {
  if (amount <= 0) return 0;
  if (frequency === 'BIWEEKLY_15_30') return amount * 2;
  if (frequency === 'WEEKLY') return (amount * 52) / 12;
  return amount;
}

export function calculateSpendingLimit(monthlyIncome: number, monthlySavings: number): number {
  return Math.max(0, monthlyIncome - monthlySavings);
}

export function calculateSavingsFromPercentage(incomePerPayment: number, percentage: number): number {
  if (incomePerPayment <= 0 || percentage <= 0) return 0;
  return Math.round((incomePerPayment * percentage) / 100);
}

export function resolvePaydayDays(
  frequency: IncomeFrequency,
  preset: PaydayPreset,
  customDay1: number = 15,
  customDay2: number = 30,
): { dayOfMonth: number | null; secondDayOfMonth: number | null } {
  if (frequency !== 'BIWEEKLY_15_30') {
    return { dayOfMonth: frequency === 'MONTHLY' ? 1 : null, secondDayOfMonth: null };
  }
  if (preset === '15_30') return { dayOfMonth: 15, secondDayOfMonth: 30 };
  if (preset === '14_29') return { dayOfMonth: 14, secondDayOfMonth: 29 };
  if (preset === '10_25') return { dayOfMonth: 10, secondDayOfMonth: 25 };
  return {
    dayOfMonth: Math.max(1, Math.min(31, customDay1)),
    secondDayOfMonth: Math.max(1, Math.min(31, customDay2)),
  };
}
