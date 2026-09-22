import { prisma } from '../../../config/database';
import type { DetectedUnregisteredCard } from '@bills/contracts';
import type { CardDetectionReader } from '../application/credit-card.ports';

export class PrismaCardDetectionReader implements CardDetectionReader {
  public async findUnregisteredCards(workspaceId: string): Promise<DetectedUnregisteredCard[]> {
    const registeredCards = await prisma.creditCard.findMany({
      where: { workspaceId },
      select: { institutionCode: true, cardLast4: true },
    });

    const registeredSet = new Set(
      registeredCards.map((c) => `${c.institutionCode.toUpperCase()}:${c.cardLast4}`),
    );

    const grouped = await prisma.transaction.groupBy({
      by: ['institutionCode', 'cardLast4'],
      where: {
        workspaceId,
        deletedAt: null,
        cardLast4: { not: null },
      },
      _count: { id: true },
      _max: { transactionDate: true },
    });

    const unregistered: DetectedUnregisteredCard[] = [];

    for (const group of grouped) {
      if (!group.cardLast4 || group.cardLast4.trim().length === 0) continue;
      const key = `${group.institutionCode.toUpperCase()}:${group.cardLast4}`;
      if (registeredSet.has(key)) continue;

      unregistered.push({
        institutionCode: group.institutionCode,
        cardLast4: group.cardLast4,
        transactionCount: group._count.id,
        lastUsedAt: group._max.transactionDate ? group._max.transactionDate.toISOString() : null,
      });
    }

    unregistered.sort((a, b) => b.transactionCount - a.transactionCount);
    return unregistered;
  }
}
