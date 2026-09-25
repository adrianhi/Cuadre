import { describe, expect, it, vi } from 'vitest';
import { calculatePaydayAmounts, currentPaydayCycle } from '../src/modules/payday-ritual/domain/payday-cycle';
import { PaydayRitualService } from '../src/modules/payday-ritual';
import { prisma } from '../src/config/database';
import { PrismaPaydayIncomeReader } from '../src/modules/payday-ritual/infrastructure/prisma-payday-income.reader';

vi.mock('../src/config/database', () => ({
  prisma: {
    incomeStream: { findMany: vi.fn() },
  },
}));

describe('payday ritual', () => {
  it('uses February last day as the second payday', () => {
    expect(currentPaydayCycle('2028-02-29')).toMatchObject({
      key: '2028-02-29', start: '2028-02-29', end: '2028-03-14', daysRemaining: 15,
    });
  });

  it('keeps the day 30 cycle active through the next day 14', () => {
    expect(currentPaydayCycle('2026-10-01')).toMatchObject({
      key: '2026-09-30', start: '2026-09-30', end: '2026-10-14', daysRemaining: 14,
    });
  });

  it('separates available money and overage', () => {
    expect(calculatePaydayAmounts({
      plannedIncome: 20_000, paidFixed: 4_000, otherSpent: 3_000, futureFixed: 2_000, daysRemaining: 10,
    })).toEqual({ available: 11_000, overage: 0, dailyAvailable: 1_100 });
    expect(calculatePaydayAmounts({
      plannedIncome: 5_000, paidFixed: 4_000, otherSpent: 3_000, futureFixed: 0, daysRemaining: 2,
    })).toEqual({ available: 0, overage: 2_000, dailyAvailable: 0 });
  });

  it('returns unavailable without a configured biweekly income', async () => {
    const service = new PaydayRitualService(
      { plannedBiweeklyIncome: async () => 0 },
      { summarizeCycle: async () => ({ paidFixed: 0, otherSpent: 0 }) },
      { sumFutureThrough: async () => 0 },
      { completedAt: async () => null, complete: async () => new Date() },
    );
    expect((await service.current('workspace', 'profile', 'DOP')).status).toBe('UNAVAILABLE');
  });

  it('calculates proportional biweekly income across active streams in PrismaPaydayIncomeReader', async () => {
    vi.mocked(prisma.incomeStream.findMany).mockResolvedValue([
      { id: '1', amount: 30000, frequency: 'BIWEEKLY_15_30', savingsTarget: 5000, dayOfMonth: 14, secondDayOfMonth: 29, isActive: true },
      { id: '2', amount: 50000, frequency: 'MONTHLY', savingsTarget: 10000, isActive: true },
      { id: '3', amount: 5000, frequency: 'WEEKLY', savingsTarget: null, isActive: true },
      { id: '4', amount: 10000, frequency: 'CUSTOM', savingsTarget: null, isActive: true },
    ] as any);

    const reader = new PrismaPaydayIncomeReader();
    const details = await reader.getIncomePlanDetails('workspace', 'DOP');
    expect(details.plannedBiweeklyIncome).toBe(65000);
    expect(details.savingsTarget).toBe(10000); // 5000 + 5000 (10000/2)
    expect(details.paydayDays).toEqual([14, 29]);
  });

  it('supports custom payday days such as 14 and 29', () => {
    // On the 14th, cycle is from 14th to 28th
    const midCycle = currentPaydayCycle('2026-10-14', [14, 29]);
    expect(midCycle).toMatchObject({
      start: '2026-10-14',
      end: '2026-10-28',
      daysRemaining: 15,
    });

    // On the 29th, cycle is from 29th to 13th of next month
    const endCycle = currentPaydayCycle('2026-10-29', [14, 29]);
    expect(endCycle).toMatchObject({
      start: '2026-10-29',
      end: '2026-11-13',
    });
  });

  it('protects savings target in calculatePaydayAmounts', () => {
    const withSavings = calculatePaydayAmounts({
      plannedIncome: 25_000,
      paidFixed: 6_000,
      otherSpent: 2_000,
      futureFixed: 2_000,
      savingsTarget: 5_000,
      daysRemaining: 15,
    });
    // Deductions: 5000 (savings) + 6000 + 2000 + 2000 = 15000
    // Available: 25000 - 15000 = 10000
    expect(withSavings.available).toBe(10_000);
    expect(withSavings.dailyAvailable).toBe(666.67);
  });

  it('detects when savings target has been met in cycle', async () => {
    const service = new PaydayRitualService(
      {
        plannedBiweeklyIncome: async () => 25_000,
        getIncomePlanDetails: async () => ({
          plannedBiweeklyIncome: 25_000,
          savingsTarget: 5_000,
          paydayDays: [14, 29],
        }),
      },
      { summarizeCycle: async () => ({ paidFixed: 5_000, otherSpent: 1_000 }) },
      { sumFutureThrough: async () => 2_000 },
      { completedAt: async () => null, complete: async () => new Date() },
      undefined,
      { findSavingsTransfersInCycle: async () => 5_000 }, // Savings transferred = 5,000
    );

    const ritual = await service.current('workspace', 'profile', 'DOP', new Date('2026-10-15T12:00:00Z'));
    expect(ritual.eligible).toBe(true);
    expect(ritual.savingsTarget).toBe(5_000);
    expect(ritual.savingsTransferred).toBe(5_000);
    expect(ritual.savingsStatus).toBe('MET');
    expect(ritual.paydayDays).toEqual([14, 29]);
    expect(ritual.available).toBe(12_000); // 25000 - (5000 savings + 5000 fixed + 1000 other + 2000 future)
  });
});
