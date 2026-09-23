import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';
import { logger } from '../../../shared/observability/logger';
import { calculateBalances, hashParticipantToken, simplifyBalances } from '../domain/coro-domain';
import type { PrismaCoroGroupStore } from './prisma-coro-group.store';

export class PrismaCoroSettlementStore {
  constructor(private readonly groups: PrismaCoroGroupStore) {}

  async lock(workspaceId: string, profileId: string, id: string) {
    await prisma.$transaction(async (tx) => {
      const group = await tx.coroGroup.findFirst({ where: { id, workspaceId }, include: {
        participants: true,
        expenses: { where: { deletedAt: null }, include: { splits: true, payers: true } },
      } });
      if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
      if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya fue cerrado.');
      const balances = calculateBalances(group.participants.map((item) => item.id), group.expenses.map((expense) => ({
        id: expense.id, title: expense.title, currency: expense.currency,
        amountCents: Math.round(Number(expense.amount) * 100), expenseDate: expense.expenseDate,
        paidById: expense.paidById,
        payers: expense.payers.length > 0
          ? expense.payers.map((p) => ({ participantId: p.participantId, amountCents: Math.round(Number(p.amount) * 100) }))
          : undefined,
        splits: expense.splits.map((split) => ({
          participantId: split.participantId, amountCents: Math.round(Number(split.assignedAmount) * 100),
        })),
      })));
      const transfers = simplifyBalances(balances);
      if (transfers.length) await tx.coroSettlement.createMany({ data: transfers.map((item) => ({
        coroGroupId: id, fromParticipantId: item.fromId, toParticipantId: item.toId,
        amount: new Prisma.Decimal(item.amountCents).div(100),
      })) });
      await tx.coroGroup.update({ where: { id }, data: { status: 'LOCKED', lockedAt: new Date() } });
    }, { isolationLevel: 'Serializable' });
    logger.info('coro_locked', { workspaceId, coroGroupId: id });
    return this.groups.detail(workspaceId, profileId, id);
  }

  async archive(workspaceId: string, profileId: string, id: string) {
    const group = await prisma.coroGroup.findFirst({ where: { id, workspaceId } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status === 'ARCHIVED') return this.groups.detail(workspaceId, profileId, id);
    await prisma.$transaction([
      prisma.coroGroup.update({ where: { id }, data: { status: 'ARCHIVED', archivedAt: new Date() } }),
      prisma.coroParticipant.updateMany({ where: { coroGroupId: id, claimTokenHash: { not: null } },
        data: { claimTokenHash: null, tokenRevokedAt: new Date(), paymentDetailsEncrypted: null } }),
    ]);
    return this.groups.detail(workspaceId, profileId, id);
  }

  private async guestContext(slug: string, token: string, settlementId: string) {
    const group = await prisma.coroGroup.findUnique({ where: { slug }, include: { participants: true } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status !== 'LOCKED') throw new AppError(409, 'CORO_NOT_LOCKED', 'El coro aún no tiene pagos definitivos.');
    const viewer = group.participants.find((item) => item.claimTokenHash === hashParticipantToken(token));
    if (!viewer) throw new AppError(401, 'INVALID_CORO_PARTICIPANT_SESSION', 'La identidad del coro no es válida.');
    const settlement = await prisma.coroSettlement.findFirst({ where: { id: settlementId, coroGroupId: group.id } });
    if (!settlement) throw new AppError(404, 'CORO_SETTLEMENT_NOT_FOUND', 'Pago no encontrado.');
    return { group, viewer, settlement };
  }

  async markPaid(slug: string, token: string, settlementId: string, note?: string | null) {
    const { viewer, settlement } = await this.guestContext(slug, token, settlementId);
    if (settlement.fromParticipantId !== viewer.id) throw new AppError(403, 'CORO_SETTLEMENT_FORBIDDEN', 'Solo el deudor puede marcar este pago.');
    if (settlement.status === 'CONFIRMED') throw new AppError(409, 'CORO_SETTLEMENT_CONFIRMED', 'Este pago ya fue confirmado.');
    if (settlement.status === 'PENDING') await prisma.coroSettlement.update({ where: { id: settlementId },
      data: { status: 'MARKED_PAID', markedPaidAt: new Date(), paymentNote: note ?? null } });
    logger.info('coro_settlement_marked_paid', { coroGroupId: settlement.coroGroupId, settlementId });
    return this.groups.publicDetail(slug, token);
  }

  async confirm(slug: string, token: string, settlementId: string) {
    const { viewer, settlement } = await this.guestContext(slug, token, settlementId);
    if (settlement.toParticipantId !== viewer.id) throw new AppError(403, 'CORO_SETTLEMENT_FORBIDDEN', 'Solo el acreedor puede confirmar este pago.');
    if (settlement.status === 'PENDING') throw new AppError(409, 'CORO_SETTLEMENT_NOT_MARKED', 'El deudor aún no ha marcado el pago.');
    if (settlement.status === 'MARKED_PAID') await prisma.coroSettlement.update({ where: { id: settlementId }, data: {
      status: 'CONFIRMED', confirmedAt: new Date(), confirmedByParticipantId: viewer.id,
    } });
    logger.info('coro_settlement_confirmed', { coroGroupId: settlement.coroGroupId, settlementId });
    return this.groups.publicDetail(slug, token);
  }

  async confirmOwner(workspaceId: string, profileId: string, groupId: string, settlementId: string) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId }, include: { participants: true } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    const owner = group.participants.find((item) => item.profileId === profileId && item.isOwner);
    if (!owner) throw new AppError(403, 'CORO_OWNER_REQUIRED', 'Solo el anfitrión puede confirmar este pago.');
    const result = await prisma.coroSettlement.updateMany({ where: {
      id: settlementId, coroGroupId: groupId, status: 'MARKED_PAID',
    }, data: { status: 'CONFIRMED', confirmedAt: new Date(), confirmedByParticipantId: owner.id } });
    if (!result.count) throw new AppError(409, 'CORO_SETTLEMENT_NOT_MARKED', 'El pago no está listo para confirmar.');
    return this.groups.detail(workspaceId, profileId, groupId);
  }

  async markPaidOwner(workspaceId: string, profileId: string, groupId: string, settlementId: string, note?: string | null) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId }, include: { participants: true } });
    const owner = group?.participants.find((item) => item.profileId === profileId && item.isOwner);
    if (!group || !owner) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    const result = await prisma.coroSettlement.updateMany({ where: {
      id: settlementId, coroGroupId: groupId, fromParticipantId: owner.id, status: 'PENDING',
    }, data: { status: 'MARKED_PAID', markedPaidAt: new Date(), paymentNote: note ?? null } });
    if (!result.count) throw new AppError(409, 'CORO_SETTLEMENT_FORBIDDEN', 'Este pago no puede marcarse desde tu cuenta.');
    return this.groups.detail(workspaceId, profileId, groupId);
  }
}
