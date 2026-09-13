import { describe, expect, it } from 'vitest';
import { calculateSimulatedMargin, SIMULATOR_PRESETS } from './margin-simulator';

describe('calculateSimulatedMargin', () => {
  it('calculates ON_TRACK status and correct daily margin when spending is normal', () => {
    const result = calculateSimulatedMargin({
      monthlyLimit: 50000,
      spentBeforeToday: 14000,
      commitments: 18000,
      daysRemaining: 12,
      spentToday: 500,
    });

    // Pool before today: 50000 - 14000 - 18000 = 18000
    // Initial daily allowance: 18000 / 12 = 1500
    // Today available: 1500 - 500 = 1000
    expect(result.initialDailyAllowance).toBe(1500);
    expect(result.todayAvailable).toBe(1000);
    expect(result.remainingMonthlyMargin).toBe(17500);
    expect(result.status).toBe('ON_TRACK');
    expect(result.percentageUsedToday).toBe(33);
  });

  it('calculates ADJUSTING status when today allowance is fully spent or exceeded', () => {
    const result = calculateSimulatedMargin({
      monthlyLimit: 50000,
      spentBeforeToday: 14000,
      commitments: 18000,
      daysRemaining: 12,
      spentToday: 1600, // exceeds 1500 daily allowance
    });

    expect(result.initialDailyAllowance).toBe(1500);
    expect(result.todayAvailable).toBe(0);
    expect(result.status).toBe('ADJUSTING');
    expect(result.percentageUsedToday).toBe(100);
  });

  it('calculates EXCEEDED status when monthly budget is consumed or overspent', () => {
    const result = calculateSimulatedMargin({
      monthlyLimit: 30000,
      spentBeforeToday: 20000,
      commitments: 10000, // total 30,000 = monthlyLimit
      daysRemaining: 10,
      spentToday: 500,
    });

    expect(result.initialDailyAllowance).toBe(0);
    expect(result.todayAvailable).toBe(0);
    expect(result.remainingMonthlyMargin).toBe(0);
    expect(result.status).toBe('EXCEEDED');
  });

  it('safely handles zero and negative numbers without NaN or negative outputs', () => {
    const result = calculateSimulatedMargin({
      monthlyLimit: -5000,
      spentBeforeToday: -100,
      commitments: -200,
      daysRemaining: -3,
      spentToday: -50,
    });

    expect(result.monthlyLimit).toBe(0);
    expect(result.daysRemaining).toBe(1);
    expect(result.todayAvailable).toBe(0);
    expect(result.status).toBe('EXCEEDED');
  });

  it('provides valid presets with realistic numbers', () => {
    expect(SIMULATOR_PRESETS).toHaveLength(3);
    for (const preset of SIMULATOR_PRESETS) {
      const result = calculateSimulatedMargin(preset);
      expect(result.todayAvailable).toBeGreaterThan(0);
      expect(result.status).toBe('ON_TRACK');
      expect(result.remainingMonthlyMargin).toBeGreaterThan(0);
    }
  });
});
