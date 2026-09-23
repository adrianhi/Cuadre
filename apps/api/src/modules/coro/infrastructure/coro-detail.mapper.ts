import type { Prisma } from '@prisma/client';
import type { CoroPaymentDestination, CoroPublicDetail } from '@bills/contracts';
import { SecretCryptoService } from '../../../shared/infrastructure/secret-crypto.service';
import { calculateBalances, simplifyBalances, type CoroExpenseValue } from '../domain/coro-domain';

export const coroDetailInclude = {
  participants: { orderBy: { createdAt: 'asc' as const } },
  expenses: {
    where: { deletedAt: null }, orderBy: { expenseDate: 'desc' as const },
    include: { paidBy: true, splits: true, payers: { include: { participant: true } } },
  },
  settlements: {
    orderBy: { createdAt: 'asc' as const },
    include: { fromParticipant: true, toParticipant: true },
  },
} satisfies Prisma.CoroGroupInclude;

export type CoroDetailRecord = Prisma.CoroGroupGetPayload<{ include: typeof coroDetailInclude }>;

function decryptPayment(value: string | null): CoroPaymentDestination | null {
  if (!value) return null;
  try { return JSON.parse(SecretCryptoService.decrypt(value)) as CoroPaymentDestination; }
  catch { return null; }
}

function expenseValues(group: CoroDetailRecord): CoroExpenseValue[] {
  return group.expenses.map((expense) => ({
    id: expense.id, title: expense.title, amountCents: Math.round(Number(expense.amount) * 100),
    currency: expense.currency, expenseDate: expense.expenseDate, paidById: expense.paidById,
    payers: expense.payers.length > 0
      ? expense.payers.map((p) => ({ participantId: p.participantId, amountCents: Math.round(Number(p.amount) * 100) }))
      : undefined,
    splits: expense.splits.map((split) => ({
      participantId: split.participantId, amountCents: Math.round(Number(split.assignedAmount) * 100),
    })),
  }));
}

export function mapCoroDetail(
  group: CoroDetailRecord,
  viewerParticipantId: string | null,
  ownerAccess = false,
): CoroPublicDetail {
  const values = expenseValues(group);
  const balances = calculateBalances(group.participants.map((item) => item.id), values);
  const balanceById = new Map(balances.map((item) => [item.participantId, item]));
  const persisted = group.settlements.map((item) => ({
    id: item.id, fromId: item.fromParticipantId, fromName: item.fromParticipant.name,
    toId: item.toParticipantId, toName: item.toParticipant.name,
    amount: Number(item.amount), status: item.status,
    paymentNote: item.paymentNote ?? null,
  }));
  const provisional = simplifyBalances(balances).map((item) => ({
    id: null, fromId: item.fromId,
    fromName: group.participants.find((p) => p.id === item.fromId)!.name,
    toId: item.toId, toName: group.participants.find((p) => p.id === item.toId)!.name,
    amount: item.amountCents / 100, status: 'PENDING' as const,
    paymentNote: null,
  }));
  const settlements = group.status === 'ACTIVE' ? provisional : persisted;
  return {
    id: group.id, slug: group.slug, name: group.name, description: group.description,
    currency: group.currency as 'DOP' | 'USD', status: group.status,
    totalAmount: values.reduce((sum, item) => sum + item.amountCents, 0) / 100,
    viewerParticipantId, createdAt: group.createdAt.toISOString(),
    lockedAt: group.lockedAt?.toISOString() ?? null, archivedAt: group.archivedAt?.toISOString() ?? null,
    participants: group.participants.map((participant) => {
      const balance = balanceById.get(participant.id)!;
      const canSeePayment = group.status !== 'ARCHIVED' && Boolean(viewerParticipantId)
        && (viewerParticipantId === participant.id
          || settlements.some((item) => item.fromId === viewerParticipantId && item.toId === participant.id));
      return {
        id: participant.id, name: participant.name, isOwner: participant.isOwner,
        isClaimed: Boolean(participant.claimTokenHash || participant.profileId),
        ...(canSeePayment ? { paymentDestination: decryptPayment(participant.paymentDetailsEncrypted) } : {}),
        totalPaid: balance.paidCents / 100, totalOwed: balance.owedCents / 100,
        netBalance: balance.netCents / 100,
      };
    }),
    expenses: group.expenses.map((expense) => ({
      id: expense.id, paidById: expense.paidById, paidByName: expense.paidBy.name,
      createdByParticipantId: expense.createdByParticipantId, title: expense.title,
      amount: Number(expense.amount), currency: expense.currency as 'DOP' | 'USD',
      category: expense.category, expenseDate: expense.expenseDate.toISOString(), notes: expense.notes,
      splitParticipantIds: expense.splits.map((split) => split.participantId),
      transactionId: expense.transactionId,
      canEdit: ownerAccess || viewerParticipantId === expense.createdByParticipantId,
      payers: expense.payers.map((p) => ({
        participantId: p.participantId,
        participantName: p.participant.name,
        amount: Number(p.amount),
      })),
    })),
    settlements: settlements.map((item) => {
      const destination = group.participants.find((p) => p.id === item.toId)?.paymentDetailsEncrypted;
      const canSee = group.status !== 'ARCHIVED' && viewerParticipantId === item.fromId;
      return {
        ...item, ...(canSee ? { toPaymentDestination: decryptPayment(destination ?? null) } : {}),
        canMarkPaid: item.status === 'PENDING' && viewerParticipantId === item.fromId,
        canConfirm: item.status === 'MARKED_PAID'
          && (ownerAccess || viewerParticipantId === item.toId),
      };
    }),
  };
}
