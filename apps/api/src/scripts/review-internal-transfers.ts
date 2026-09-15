import { prisma } from '../config/database';
import {
  assertReviewedIds,
  findHistoricalSelfTransferCandidates,
  summarizeHistoricalCandidates,
} from '../modules/transactions';

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const structuralTransferWhere = {
  OR: [
    { transactionType: { contains: 'transfer', mode: 'insensitive' as const } },
    { category: { contains: 'transfer', mode: 'insensitive' as const } },
    { source: { contains: 'transfer', mode: 'insensitive' as const } },
  ],
};

async function run() {
  const apply = process.argv.includes('--apply');
  const workspaceId = argument('workspace');
  const ids = [...new Set((argument('ids') || '').split(',').map((id) => id.trim()).filter(Boolean))];
  if (apply && ids.length === 0) throw new Error('--apply requiere --ids con una lista explícita revisada.');

  const rows = await prisma.transaction.findMany({
    where: {
      deletedAt: null,
      ...(workspaceId ? { workspaceId } : {}),
      ...(apply ? { id: { in: ids } } : {}),
      ...structuralTransferWhere,
    },
    select: {
      id: true, workspaceId: true, institutionCode: true, transactionDate: true, amount: true, currency: true,
      transactionType: true, category: true, source: true, merchant: true, rawMerchant: true,
      financialRole: true, financialRoleOrigin: true, classificationVersion: true,
    },
  });
  const workspaceIds = [...new Set(rows.map((row) => row.workspaceId).filter((id): id is string => Boolean(id)))];
  const memberships = await prisma.workspaceMember.findMany({
    where: { workspaceId: { in: workspaceIds }, role: 'OWNER', profile: { displayName: { not: null } } },
    select: { workspaceId: true, profile: { select: { displayName: true } } },
  });
  const owners = new Map<string, string[]>();
  for (const membership of memberships) {
    if (!membership.profile.displayName) continue;
    owners.set(membership.workspaceId, [...(owners.get(membership.workspaceId) || []), membership.profile.displayName]);
  }
  const candidates = findHistoricalSelfTransferCandidates(rows, owners);
  const publicCandidates = candidates.map(({ classificationVersion: _, ...candidate }) => candidate);

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', workspaceId: workspaceId || 'ALL',
      ...summarizeHistoricalCandidates(candidates), candidates: publicCandidates }, null, 2));
    return;
  }

  const reviewed = assertReviewedIds(ids, rows, candidates, workspaceId);
  const updated = await prisma.$transaction(async (tx) => {
    const applied: string[] = [];
    for (const candidate of reviewed.applicable) {
      const result = await tx.transaction.updateMany({
        where: {
          id: candidate.id, workspaceId: candidate.workspaceId,
          classificationVersion: candidate.classificationVersion,
          financialRole: { not: 'INTERNAL_TRANSFER' }, financialRoleOrigin: { not: 'MANUAL' },
        },
        data: {
          financialRole: 'INTERNAL_TRANSFER', financialRoleOrigin: 'MIGRATION', suggestedFinancialRole: null,
          category: 'Transferencias Propias', transactionType: 'Transferencia entre Cuentas',
          classificationVersion: { increment: 1 },
        },
      });
      if (result.count !== 1) throw new Error(`El movimiento ${candidate.id} cambió durante la revisión.`);
      applied.push(candidate.id);
    }
    return applied;
  });
  console.log(JSON.stringify({ mode: 'apply', applied: updated, alreadyApplied: reviewed.alreadyApplied }, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
