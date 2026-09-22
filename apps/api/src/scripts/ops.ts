import crypto from 'crypto';
import { prisma } from '../config/database';

const [command = 'status', ...args] = process.argv.slice(2);
const option = (name: string) => args[args.indexOf(name) + 1];
const supportRef = (value: string) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);

async function remoteStatus() {
  const baseUrl = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
  const secret = process.env.MAINTENANCE_SECRET;
  if (!baseUrl || !secret) throw new Error('API_PUBLIC_URL and MAINTENANCE_SECRET are required for ops:status.');
  const response = await fetch(`${baseUrl}/api/v1/internal/ops/status`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error(`Operations endpoint responded with HTTP ${response.status}.`);
  return response.json() as Promise<{ data: Record<string, unknown> }>;
}

async function userStatus() {
  const email = option('--email')?.trim().toLowerCase();
  if (!email) throw new Error('Use: npm run ops:user -- --email person@example.com');
  const profile = await prisma.profile.findUnique({
    where: { email },
    select: {
      id: true, createdAt: true, onboardingCompletedAt: true,
      memberships: {
        select: {
          workspaceId: true,
          workspace: {
            select: {
              inboxConnections: {
                select: { status: true, lastSuccessfulSyncAt: true, lastErrorCode: true },
                orderBy: { createdAt: 'desc' }, take: 3,
              },
              _count: { select: { transactions: true, ingestionJobs: true } },
            },
          },
        },
      },
    },
  });
  if (!profile) return { found: false, supportRef: supportRef(email) };
  return {
    found: true,
    supportRef: supportRef(profile.id),
    createdAt: profile.createdAt,
    onboardingComplete: Boolean(profile.onboardingCompletedAt),
    workspaces: profile.memberships.map(({ workspaceId, workspace }) => ({
      workspaceRef: supportRef(workspaceId),
      connections: workspace.inboxConnections,
      counts: workspace._count,
    })),
  };
}

async function metrics() {
  const hours = Math.min(Math.max(Number(option('--hours') || 24), 1), 720);
  const since = new Date(Date.now() - hours * 3_600_000);
  const [profiles, jobs, emails, failedEvents] = await Promise.all([
    prisma.profile.count({ where: { createdAt: { gte: since } } }),
    prisma.ingestionJob.groupBy({ by: ['status'], where: { updatedAt: { gte: since } }, _count: true }),
    prisma.emailDelivery.groupBy({ by: ['status'], where: { updatedAt: { gte: since } }, _count: true }),
    prisma.ingestionEvent.count({ where: { updatedAt: { gte: since }, status: 'FAILED' } }),
  ]);
  return { since: since.toISOString(), newProfiles: profiles, ingestionJobs: jobs, emailDeliveries: emails, failedEvents };
}

async function main() {
  if (command === 'status') return (await remoteStatus()).data;
  if (command === 'queues') return ((await remoteStatus()).data.queues);
  if (command === 'user') return userStatus();
  if (command === 'metrics') return metrics();
  throw new Error('Commands: status, queues, user --email <email>, metrics --hours <1-720>.');
}

main()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Operations command failed.');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
