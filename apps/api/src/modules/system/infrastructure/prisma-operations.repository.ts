import { prisma } from '../../../config/database';

function ageSeconds(date: Date | undefined): number | null {
  return date ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 1_000)) : null;
}

export class PrismaOperationsRepository {
  async inspect() {
    const dbStartedAt = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const databaseLatencyMs = Date.now() - dbStartedAt;
    const [
      ingestionPending, ingestionFailed, ingestionStalled, ingestionOldest,
      recurringPending, recurringFailed, recurringStalled, recurringOldest,
      emailPending, emailFailed, emailStalled, emailOldest,
      rulesPending, rulesFailed, rulesStalled, rulesOldest,
    ] = await Promise.all([
      prisma.ingestionJob.count({ where: { status: 'PENDING' } }),
      prisma.ingestionJob.count({ where: { status: 'FAILED' } }),
      prisma.ingestionJob.count({ where: { status: 'PROCESSING', leaseUntil: { lt: new Date() } } }),
      prisma.ingestionJob.findFirst({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
      prisma.recurringScanJob.count({ where: { status: 'PENDING' } }),
      prisma.recurringScanJob.count({ where: { status: 'FAILED' } }),
      prisma.recurringScanJob.count({ where: { status: 'PROCESSING', leaseUntil: { lt: new Date() } } }),
      prisma.recurringScanJob.findFirst({ where: { status: 'PENDING' }, orderBy: { updatedAt: 'asc' }, select: { updatedAt: true } }),
      prisma.emailDelivery.count({ where: { status: 'PENDING' } }),
      prisma.emailDelivery.count({ where: { status: 'FAILED' } }),
      prisma.emailDelivery.count({ where: { status: 'PROCESSING', leaseUntil: { lt: new Date() } } }),
      prisma.emailDelivery.findFirst({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
      prisma.ruleApplication.count({ where: { status: 'QUEUED' } }),
      prisma.ruleApplication.count({ where: { status: 'FAILED' } }),
      prisma.ruleApplication.count({ where: { status: 'PROCESSING', leaseUntil: { lt: new Date() } } }),
      prisma.ruleApplication.findFirst({ where: { status: 'QUEUED' }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    ]);
    return {
      database: { status: 'ready' as const, latencyMs: databaseLatencyMs },
      queues: {
        ingestion: { pending: ingestionPending, failed: ingestionFailed, stalled: ingestionStalled,
          oldestPendingAgeSeconds: ageSeconds(ingestionOldest?.createdAt) },
        recurring: { pending: recurringPending, failed: recurringFailed, stalled: recurringStalled,
          oldestPendingAgeSeconds: ageSeconds(recurringOldest?.updatedAt) },
        email: { pending: emailPending, failed: emailFailed, stalled: emailStalled,
          oldestPendingAgeSeconds: ageSeconds(emailOldest?.createdAt) },
        rules: { pending: rulesPending, failed: rulesFailed, stalled: rulesStalled,
          oldestPendingAgeSeconds: ageSeconds(rulesOldest?.createdAt) },
      },
    };
  }
}
