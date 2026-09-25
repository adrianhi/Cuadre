import { prisma } from '../../../config/database';
import type { PaydaySavingsReader } from '../application/payday-ritual.ports';

export class PrismaPaydaySavingsReader implements PaydaySavingsReader {
  async findSavingsTransfersInCycle(
    workspaceId: string,
    currency: string,
    start: string,
    through: string,
  ): Promise<number> {
    const fromDate = new Date(`${start}T00:00:00.000Z`);
    const toDate = new Date(`${through}T23:59:59.999Z`);

    const transfers = await prisma.transaction.findMany({
      where: {
        workspaceId,
        currency,
        deletedAt: null,
        transactionDate: { gte: fromDate, lte: toDate },
        OR: [
          { financialRole: 'INTERNAL_TRANSFER' },
          { category: { contains: 'transfer', mode: 'insensitive' } },
          { category: { contains: 'ahorro', mode: 'insensitive' } },
          { merchant: { contains: 'ahorro', mode: 'insensitive' } },
          { merchant: { contains: 'fondo', mode: 'insensitive' } },
          { merchant: { contains: 'inversion', mode: 'insensitive' } },
          { merchant: { contains: 'saving', mode: 'insensitive' } },
        ],
      },
      select: { amount: true },
    });

    const sum = transfers.reduce((acc, t) => acc + Number(t.amount), 0);
    return Math.round(sum * 100) / 100;
  }
}
