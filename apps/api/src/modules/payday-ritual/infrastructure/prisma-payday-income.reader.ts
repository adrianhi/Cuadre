import { prisma } from '../../../config/database';
import type { PaydayIncomeDetails, PaydayIncomeReader } from '../application/payday-ritual.ports';

export class PrismaPaydayIncomeReader implements PaydayIncomeReader {
  async plannedBiweeklyIncome(workspaceId: string, currency: string) {
    const details = await this.getIncomePlanDetails(workspaceId, currency);
    return details.plannedBiweeklyIncome;
  }

  async getIncomePlanDetails(workspaceId: string, currency: string): Promise<PaydayIncomeDetails> {
    const streams = await prisma.incomeStream.findMany({
      where: { workspaceId, currency, isActive: true },
      orderBy: { amount: 'desc' },
    });

    let totalIncome = 0;
    let totalSavings = 0;
    let primaryPaydayDays: [number, number] = [15, 30];
    let paydayDaysFound = false;

    for (const stream of streams) {
      const amount = Number(stream.amount);
      const savings = stream.savingsTarget !== null ? Number(stream.savingsTarget) : 0;

      if (stream.frequency === 'BIWEEKLY_15_30') {
        totalIncome += amount;
        totalSavings += savings;
        if (!paydayDaysFound && stream.dayOfMonth) {
          const d1 = stream.dayOfMonth;
          const d2 = stream.secondDayOfMonth || Math.min(30, d1 + 15);
          primaryPaydayDays = [d1, d2];
          paydayDaysFound = true;
        }
      } else if (stream.frequency === 'MONTHLY') {
        totalIncome += Math.round((amount / 2) * 100) / 100;
        totalSavings += Math.round((savings / 2) * 100) / 100;
      } else if (stream.frequency === 'WEEKLY') {
        totalIncome += Math.round((amount * 2) * 100) / 100;
        totalSavings += Math.round((savings * 2) * 100) / 100;
      }
    }

    return {
      plannedBiweeklyIncome: Math.round(totalIncome * 100) / 100,
      savingsTarget: Math.round(totalSavings * 100) / 100,
      paydayDays: primaryPaydayDays,
    };
  }
}
