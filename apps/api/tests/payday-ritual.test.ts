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
      { id: '1', amount: 30000, frequency: 'BIWEEKLY_15_30', isActive: true },
      { id: '2', amount: 50000, frequency: 'MONTHLY', isActive: true },
      { id: '3', amount: 5000, frequency: 'WEEKLY', isActive: true },
      { id: '4', amount: 10000, frequency: 'CUSTOM', isActive: true },
    ] as any);

    const reader = new PrismaPaydayIncomeReader();
    const total = await reader.plannedBiweeklyIncome('workspace', 'DOP');
    expect(total).toBe(65000);
  });
});
