import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';
import type { BetaFunnelMetrics, BetaInviteRecord, BetaInviteStore } from '../application/beta-invite.service';

const inviteSelect = {
  id: true, email: true, code: true, expiresAt: true, usedAt: true, trialDays: true,
  emailDispatchVersion: true, source: true, campaignCode: true,
} as const;

export class PrismaBetaInviteRepository implements BetaInviteStore {
  async findOrCreate(input: {
    email: string; code: string; expiresAt: Date; trialDays: number;
    source?: string; campaignCode?: string;
  }): Promise<BetaInviteRecord> {
    try {
      return await prisma.betaInvite.upsert({
        where: { email: input.email },
        update: {
          ...(input.source ? { source: input.source } : {}),
          ...(input.campaignCode ? { campaignCode: input.campaignCode } : {}),
        },
        create: {
          email: input.email, code: input.code, expiresAt: input.expiresAt, trialDays: input.trialDays,
          source: input.source, campaignCode: input.campaignCode,
        },
        select: inviteSelect,
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      return prisma.betaInvite.findUniqueOrThrow({ where: { email: input.email }, select: inviteSelect });
    }
  }

  async refreshLink(input: {
    id: string; expectedVersion: number; code: string; expiresAt: Date; incrementDispatch: boolean;
  }) {
    const updated = await prisma.betaInvite.updateMany({
      where: { id: input.id, usedAt: null, emailDispatchVersion: input.expectedVersion },
      data: {
        code: input.code,
        expiresAt: input.expiresAt,
        ...(input.incrementDispatch ? { emailDispatchVersion: { increment: 1 } } : {}),
      },
    });
    if (!updated.count) return null;
    return prisma.betaInvite.findUnique({ where: { id: input.id }, select: inviteSelect });
  }

  async advanceDispatch(id: string, expectedVersion: number) {
    const updated = await prisma.betaInvite.updateMany({
      where: { id, usedAt: null, emailDispatchVersion: expectedVersion },
      data: { emailDispatchVersion: { increment: 1 } },
    });
    if (!updated.count) return null;
    return prisma.betaInvite.findUnique({ where: { id }, select: inviteSelect });
  }

  async oldestPendingInterests(limit: number) {
    const invited = await prisma.betaInvite.findMany({ select: { email: true } });
    return prisma.betaInterest.findMany({
      where: invited.length ? { email: { notIn: invited.map((item) => item.email) } } : undefined,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: limit,
      select: { email: true, campaignCode: true },
    });
  }

  async funnelMetrics(): Promise<BetaFunnelMetrics> {
    const [interests, invites, deliveries] = await Promise.all([
      prisma.betaInterest.findMany({ select: { email: true } }),
      prisma.betaInvite.findMany({ select: { id: true, email: true, usedAt: true } }),
      prisma.emailDelivery.findMany({
        where: { betaInviteId: { not: null }, kind: 'BETA_INVITE' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { betaInviteId: true, status: true, deliveryMode: true, processedAt: true },
      }),
    ]);
    const inviteEmails = new Set(invites.map((item) => item.email));
    const latest = new Map<string, typeof deliveries[number]>();
    for (const delivery of deliveries) {
      if (delivery.betaInviteId && !latest.has(delivery.betaInviteId)) latest.set(delivery.betaInviteId, delivery);
    }
    const profiles = invites.length ? await prisma.profile.findMany({
      where: { email: { in: invites.map((item) => item.email) } },
      select: {
        onboardingCompletedAt: true,
        memberships: { select: { workspace: { select: {
          inboxConnections: {
            where: { provider: 'GOOGLE', status: 'ACTIVE' },
            select: { institutionSubscriptions: { where: { enabled: true }, select: { id: true } } },
          },
        } } } },
      },
    }) : [];
    const latestValues = [...latest.values()];
    const activatedTotal = invites.filter((item) => item.usedAt).length;
    const terminalFailures = new Set(['FAILED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED', 'UNKNOWN']);
    return {
      interestedTotal: interests.length,
      interestedPending: interests.filter((item) => !inviteEmails.has(item.email)).length,
      invitedTotal: invites.length,
      activatedTotal,
      onboardingCompleted: profiles.filter((item) => item.onboardingCompletedAt).length,
      gmailConnectedUsers: profiles.filter((profile) => profile.memberships.some((membership) =>
        membership.workspace.inboxConnections.length > 0)).length,
      enabledBanks: profiles.reduce((total, profile) => total + profile.memberships.reduce((memberTotal, membership) =>
        memberTotal + membership.workspace.inboxConnections.reduce((connectionTotal, connection) =>
          connectionTotal + connection.institutionSubscriptions.length, 0), 0), 0),
      emailNotSent: invites.length - latest.size,
      emailAudit: latestValues.filter((item) => item.deliveryMode === 'AUDIT_LOG').length,
      emailAccepted: latestValues.filter((item) => item.deliveryMode === 'SMTP' && item.status === 'ACCEPTED').length,
      emailDelivered: latestValues.filter((item) => item.deliveryMode === 'SMTP' && item.status === 'DELIVERED').length,
      emailPending: latestValues.filter((item) => ['PENDING', 'PROCESSING'].includes(item.status)
        || (item.status === 'FAILED' && !item.processedAt)).length,
      emailFailed: latestValues.filter((item) => terminalFailures.has(item.status) && Boolean(item.processedAt)).length,
      conversionPercent: invites.length ? Math.round((activatedTotal / invites.length) * 1000) / 10 : 0,
    };
  }
}
