import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyIncome,
  calculateMonthlySavings,
  calculateSavingsFromPercentage,
  calculateSpendingLimit,
  resolvePaydayDays,
} from './baseline-calculator';

describe('baseline-calculator', () => {
  it('correctly calculates monthly income and savings for quincena (50k income, 10k savings case)', () => {
    // User earns 25k per quincena = 50k monthly
    const monthlyIncome = calculateMonthlyIncome(25000, 'BIWEEKLY_15_30');
    expect(monthlyIncome).toBe(50000);

    // User wants to save 5k each quincena = 10k monthly
    const monthlySavings = calculateMonthlySavings(5000, 'BIWEEKLY_15_30');
    expect(monthlySavings).toBe(10000);

    // Living limit = 50,000 - 10,000 = 40,000
    const livingLimit = calculateSpendingLimit(monthlyIncome, monthlySavings);
    expect(livingLimit).toBe(40000);
  });

  it('calculates savings from percentage correctly', () => {
    // 20% of 25,000 = 5,000
    expect(calculateSavingsFromPercentage(25000, 20)).toBe(5000);
    // 10% of 50,000 = 5,000
    expect(calculateSavingsFromPercentage(50000, 10)).toBe(5000);
    // 15% of 40,000 = 6,000
    expect(calculateSavingsFromPercentage(40000, 15)).toBe(6000);
  });

  it('resolves standard and custom payday presets', () => {
    // 15 y 30
    const p15_30 = resolvePaydayDays('BIWEEKLY_15_30', '15_30');
    expect(p15_30).toEqual({ dayOfMonth: 15, secondDayOfMonth: 30 });

    // 14 y 29 (common in Dominican Republic)
    const p14_29 = resolvePaydayDays('BIWEEKLY_15_30', '14_29');
    expect(p14_29).toEqual({ dayOfMonth: 14, secondDayOfMonth: 29 });

    // 10 y 25
    const p10_25 = resolvePaydayDays('BIWEEKLY_15_30', '10_25');
    expect(p10_25).toEqual({ dayOfMonth: 10, secondDayOfMonth: 25 });

    // Custom days (e.g. 5 y 20)
    const custom = resolvePaydayDays('BIWEEKLY_15_30', 'custom', 5, 20);
    expect(custom).toEqual({ dayOfMonth: 5, secondDayOfMonth: 20 });

    // Monthly
    const monthly = resolvePaydayDays('MONTHLY', '15_30');
    expect(monthly).toEqual({ dayOfMonth: 1, secondDayOfMonth: null });
  });

  it('handles monthly and weekly frequencies', () => {
    expect(calculateMonthlyIncome(50000, 'MONTHLY')).toBe(50000);
    // 10,000 weekly * 52 / 12 = 43333.33...
    expect(calculateMonthlyIncome(12000, 'WEEKLY')).toBe(52000);
  });
});
