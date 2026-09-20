import { Prisma } from '@prisma/client';
import type { CreateCoroExpenseInput, LinkCoroTransactionInput, UpdateCoroExpenseInput } from '@bills/contracts';
import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';
import { logger } from '../../../shared/observability/logger';
import { hashParticipantToken, isPotentialDuplicate, splitAmountCents } from '../domain/coro-domain';
import type { PrismaCoroGroupStore } from './prisma-coro-group.store';

const MAX_EXPENSES = 1_000;

export class PrismaCoroExpenseStore {
  constructor(private readonly groups: PrismaCoroGroupStore) {}

  private async publicContext(slug: string, token: string) {
    const group = await prisma.coroGroup.findUnique({ where: { slug }, include: { participants: true } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    const viewer = group.participants.find((item) => item.claimTokenHash === hashParticipantToken(token));
    if (!viewer) throw new AppError(401, 'INVALID_CORO_PARTICIPANT_SESSION', 'La identidad del coro no es válida.');
    return { group, viewer };
  }

  private validateParticipants(participants: Array<{ id: string }>, paidById: string, splitIds: string[]) {
    const valid = new Set(participants.map((item) => item.id));
    if (!valid.has(paidById) || splitIds.some((id) => !valid.has(id))) {
      throw new AppError(400, 'INVALID_CORO_PARTICIPANT', 'Todos los participantes deben pertenecer al coro.');
    }
  }

  private async duplicates(groupId: string, input: { title: string; amount: number; expenseDate: string }, currency: string, excludeId?: string) {
    const date = new Date(input.expenseDate);
    const candidates = await prisma.coroExpense.findMany({ where: {
      coroGroupId: groupId, deletedAt: null, id: excludeId ? { not: excludeId } : undefined,
      expenseDate: { gte: new Date(date.getTime() - 86_400_000), lte: new Date(date.getTime() + 86_400_000) },
    }, select: { id: true, title: true, amount: true, currency: true, expenseDate: true, paidBy: { select: { name: true } } } });
    return candidates.filter((item) => isPotentialDuplicate(
      { title: item.title, amountCents: Math.round(Number(item.amount) * 100), currency: item.currency, expenseDate: item.expenseDate },
      { title: input.title, amountCents: Math.round(input.amount * 100), currency, expenseDate: date },
    )).map((item) => ({ id: item.id, title: item.title, amount: Number(item.amount), expenseDate: item.expenseDate.toISOString(), paidByName: item.paidBy.name }));
  }

  private async assertNoDuplicate(groupId: string, input: CreateCoroExpenseInput, currency: string, excludeId?: string) {
    const matches = await this.duplicates(groupId, input, currency, excludeId);
    if (matches.length && !input.allowPossibleDuplicate) {
      logger.info('coro_duplicate_warning', { coroGroupId: groupId, candidateCount: matches.length });
      throw new AppError(409, 'POSSIBLE_DUPLICATE', 'Encontramos un gasto parecido.', { candidates: matches });
    }
  }

  async create(slug: string, token: string, input: CreateCoroExpenseInput) {
    const { group, viewer } = await this.publicContext(slug, token);
    this.validateParticipants(group.participants, input.paidById, input.splitParticipantIds);
    const count = await prisma.coroExpense.count({ where: { coroGroupId: group.id, deletedAt: null } });
    if (count >= MAX_EXPENSES) throw new AppError(409, 'CORO_EXPENSE_LIMIT', 'El coro alcanzó 1,000 gastos.');
    await this.assertNoDuplicate(group.id, input, group.currency);
    const cents = Math.round(input.amount * 100);
    const created = await prisma.coroExpense.create({ data: {
      coroGroupId: group.id, paidById: input.paidById, createdByParticipantId: viewer.id,
      title: input.title, amount: new Prisma.Decimal(input.amount), currency: group.currency,
      category: input.category, expenseDate: new Date(input.expenseDate), notes: input.notes ?? null,
      splits: { create: splitAmountCents(cents, input.splitParticipantIds).map((split) => ({
        participantId: split.participantId, assignedAmount: new Prisma.Decimal(split.amountCents).div(100),
      })) },
    } });
    logger.info('coro_expense_created', { coroGroupId: group.id, expenseId: created.id });
    return this.groups.publicDetail(slug, token);
  }

  async updatePublic(slug: string, token: string, expenseId: string, input: UpdateCoroExpenseInput) {
    const { group, viewer } = await this.publicContext(slug, token);
    const existing = await prisma.coroExpense.findFirst({
      where: { id: expenseId, coroGroupId: group.id, deletedAt: null }, include: { splits: true },
    });
    if (!existing) throw new AppError(404, 'CORO_EXPENSE_NOT_FOUND', 'Gasto no encontrado.');
    if (existing.createdByParticipantId !== viewer.id) throw new AppError(403, 'CORO_EXPENSE_FORBIDDEN', 'Solo puedes editar los gastos que registraste.');
    const merged: CreateCoroExpenseInput = {
      title: input.title ?? existing.title, amount: input.amount ?? Number(existing.amount),
      paidById: input.paidById ?? existing.paidById, category: input.category ?? existing.category,
      expenseDate: input.expenseDate ?? existing.expenseDate.toISOString(), notes: input.notes ?? existing.notes,
      splitParticipantIds: input.splitParticipantIds ?? existing.splits.map((item) => item.participantId),
      allowPossibleDuplicate: input.allowPossibleDuplicate,
    };
    this.validateParticipants(group.participants, merged.paidById, merged.splitParticipantIds);
    await this.assertNoDuplicate(group.id, merged, group.currency, expenseId);
    const splits = splitAmountCents(Math.round(merged.amount * 100), merged.splitParticipantIds);
    await prisma.$transaction(async (tx) => {
      await tx.coroExpense.update({ where: { id: expenseId }, data: {
        title: merged.title, amount: new Prisma.Decimal(merged.amount), paidById: merged.paidById,
        category: merged.category, expenseDate: new Date(merged.expenseDate), notes: merged.notes ?? null,
      } });
      await tx.coroExpenseSplit.deleteMany({ where: { expenseId } });
      await tx.coroExpenseSplit.createMany({ data: splits.map((split) => ({
        expenseId, participantId: split.participantId, assignedAmount: new Prisma.Decimal(split.amountCents).div(100),
      })) });
    });
    return this.groups.publicDetail(slug, token);
  }

  async removePublic(slug: string, token: string, expenseId: string) {
    const { group, viewer } = await this.publicContext(slug, token);
    const result = await prisma.coroExpense.updateMany({
      where: { id: expenseId, coroGroupId: group.id, createdByParticipantId: viewer.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (!result.count) throw new AppError(404, 'CORO_EXPENSE_NOT_FOUND', 'Gasto propio no encontrado.');
    return this.groups.publicDetail(slug, token);
  }

  async removeOwner(workspaceId: string, groupId: string, expenseId: string) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    const result = await prisma.coroExpense.updateMany({ where: { id: expenseId, coroGroupId: groupId, deletedAt: null }, data: { deletedAt: new Date() } });
    if (!result.count) throw new AppError(404, 'CORO_EXPENSE_NOT_FOUND', 'Gasto no encontrado.');
  }

  async updateOwner(workspaceId: string, groupId: string, expenseId: string, input: UpdateCoroExpenseInput) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId }, include: { participants: true } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    const existing = await prisma.coroExpense.findFirst({ where: { id: expenseId, coroGroupId: groupId, deletedAt: null }, include: { splits: true } });
    if (!existing) throw new AppError(404, 'CORO_EXPENSE_NOT_FOUND', 'Gasto no encontrado.');
    const merged: CreateCoroExpenseInput = { title: input.title ?? existing.title, amount: input.amount ?? Number(existing.amount),
      paidById: input.paidById ?? existing.paidById, category: input.category ?? existing.category,
      expenseDate: input.expenseDate ?? existing.expenseDate.toISOString(), notes: input.notes ?? existing.notes,
      splitParticipantIds: input.splitParticipantIds ?? existing.splits.map((item) => item.participantId), allowPossibleDuplicate: input.allowPossibleDuplicate };
    this.validateParticipants(group.participants, merged.paidById, merged.splitParticipantIds);
    await this.assertNoDuplicate(groupId, merged, group.currency, expenseId);
    const splits = splitAmountCents(Math.round(merged.amount * 100), merged.splitParticipantIds);
    await prisma.$transaction(async (tx) => {
      await tx.coroExpense.update({ where: { id: expenseId }, data: { title: merged.title, amount: new Prisma.Decimal(merged.amount),
        paidById: merged.paidById, category: merged.category, expenseDate: new Date(merged.expenseDate), notes: merged.notes ?? null } });
      await tx.coroExpenseSplit.deleteMany({ where: { expenseId } });
      await tx.coroExpenseSplit.createMany({ data: splits.map((item) => ({ expenseId, participantId: item.participantId,
        assignedAmount: new Prisma.Decimal(item.amountCents).div(100) })) });
    });
  }

  async candidates(workspaceId: string, groupId: string) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    return prisma.transaction.findMany({ where: {
      workspaceId, deletedAt: null, statusCode: 'APPROVED', financialRole: 'EXPENSE', currency: group.currency,
      coroExpense: null, transactionDate: { gte: new Date(Date.now() - 90 * 86_400_000) },
    }, orderBy: { transactionDate: 'desc' }, take: 50,
    select: { id: true, merchant: true, amount: true, currency: true, category: true, transactionDate: true, institutionCode: true } });
  }

  async link(workspaceId: string, profileId: string, groupId: string, input: LinkCoroTransactionInput) {
    const group = await prisma.coroGroup.findFirst({ where: { id: groupId, workspaceId }, include: { participants: true } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    const count = await prisma.coroExpense.count({ where: { coroGroupId: groupId, deletedAt: null } });
    if (count >= MAX_EXPENSES) throw new AppError(409, 'CORO_EXPENSE_LIMIT', 'El coro alcanzó 1,000 gastos.');
    const owner = group.participants.find((item) => item.profileId === profileId && item.isOwner);
    const transaction = await prisma.transaction.findFirst({ where: {
      id: input.transactionId, workspaceId, deletedAt: null, statusCode: 'APPROVED', financialRole: 'EXPENSE', coroExpense: null,
    } });
    if (!owner || !transaction || transaction.currency !== group.currency) throw new AppError(400, 'INVALID_CORO_TRANSACTION', 'El movimiento no puede vincularse a este coro.');
    this.validateParticipants(group.participants, owner.id, input.splitParticipantIds);
    const expenseInput: CreateCoroExpenseInput = { title: transaction.merchant, amount: Number(transaction.amount), paidById: owner.id,
      category: transaction.category, expenseDate: transaction.transactionDate.toISOString(), notes: null,
      splitParticipantIds: input.splitParticipantIds, allowPossibleDuplicate: input.allowPossibleDuplicate };
    await this.assertNoDuplicate(group.id, expenseInput, group.currency);
    const splits = splitAmountCents(Math.round(Number(transaction.amount) * 100), input.splitParticipantIds);
    await prisma.coroExpense.create({ data: {
      coroGroupId: group.id, paidById: owner.id, createdByParticipantId: owner.id,
      transactionId: transaction.id, title: transaction.merchant, amount: transaction.amount,
      currency: transaction.currency, category: transaction.category, expenseDate: transaction.transactionDate,
      splits: { create: splits.map((item) => ({ participantId: item.participantId, assignedAmount: new Prisma.Decimal(item.amountCents).div(100) })) },
    } });
    logger.info('coro_transaction_linked', { workspaceId, coroGroupId: groupId, transactionId: transaction.id });
  }
}
