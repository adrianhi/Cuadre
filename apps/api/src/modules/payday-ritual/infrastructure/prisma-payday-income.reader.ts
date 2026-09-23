import { prisma } from '../../../config/database';
import type { PaydayIncomeReader } from '../application/payday-ritual.ports';

export class PrismaPaydayIncomeReader implements PaydayIncomeReader {
  async plannedBiweeklyIncome(workspaceId: string, currency: string) {
    const streams = await prisma.incomeStream.findMany({
      where: { workspaceId, currency, isActive: true },
    });
    let total = 0;
    for (const stream of streams) {
      const amount = Number(stream.amount);
      if (stream.frequency === 'BIWEEKLY_15_30') {
        total += amount;
      } else if (stream.frequency === 'MONTHLY') {
        total += Math.round((amount / 2) * 100) / 100;
      } else if (stream.frequency === 'WEEKLY') {
        total += Math.round((amount * 2) * 100) / 100;
      }
    }
    return Math.round(total * 100) / 100;
  }
}
