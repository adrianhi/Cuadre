import type { ClaimCoroParticipantInput, CoroPaymentDestination, CreateCoroGroupInput, UpdateCoroGroupInput } from '@bills/contracts';
import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';
import { SecretCryptoService } from '../../../shared/infrastructure/secret-crypto.service';
import { logger } from '../../../shared/observability/logger';
import { createCoroSlug, createParticipantToken, hashParticipantToken, normalizeCoroName } from '../domain/coro-domain';
import { coroDetailInclude, mapCoroDetail } from './coro-detail.mapper';

const MAX_PARTICIPANTS = 50;

export class PrismaCoroGroupStore {
  private async owned(workspaceId: string, id: string) {
    const group = await prisma.coroGroup.findFirst({ where: { id, workspaceId }, include: coroDetailInclude });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    return group;
  }

  async list(workspaceId: string) {
    const groups = await prisma.coroGroup.findMany({
      where: { workspaceId }, orderBy: { updatedAt: 'desc' }, include: coroDetailInclude,
    });
    return groups.map((group) => ({
      id: group.id, slug: group.slug, name: group.name, description: group.description,
      currency: group.currency, status: group.status, participantCount: group.participants.length,
      expenseCount: group.expenses.length,
      totalAmount: group.expenses.reduce((sum, item) => sum + Number(item.amount), 0),
      updatedAt: group.updatedAt.toISOString(),
    }));
  }

  async create(workspaceId: string, profileId: string, email: string, input: CreateCoroGroupInput) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    const ownerName = profile?.displayName?.trim() || email.split('@')[0] || 'Anfitrión';
    const seen = new Set([normalizeCoroName(ownerName)]);
    const guests = input.participantNames.filter((name) => {
      const key = normalizeCoroName(name);
      if (!key || seen.has(key)) return false;
      seen.add(key); return true;
    });
    const group = await prisma.coroGroup.create({
      data: {
        workspaceId, slug: createCoroSlug(input.name), name: input.name,
        description: input.description ?? null, currency: input.currency,
        participants: { create: [
          { profileId, name: ownerName, normalizedName: normalizeCoroName(ownerName), isOwner: true },
          ...guests.map((name) => ({ name, normalizedName: normalizeCoroName(name) })),
        ] },
      },
      include: coroDetailInclude,
    });
    const owner = group.participants.find((item) => item.profileId === profileId)!;
    logger.info('coro_created', { workspaceId, coroGroupId: group.id, participantCount: group.participants.length });
    return mapCoroDetail(group, owner.id, true);
  }

  async detail(workspaceId: string, profileId: string, id: string) {
    const group = await this.owned(workspaceId, id);
    const owner = group.participants.find((item) => item.profileId === profileId) ?? null;
    return mapCoroDetail(group, owner?.id ?? null, true);
  }

  async publicDetail(slug: string, token?: string) {
    const group = await prisma.coroGroup.findUnique({ where: { slug }, include: coroDetailInclude });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    const hash = token ? hashParticipantToken(token) : null;
    const viewer = group.status !== 'ARCHIVED' && hash
      ? group.participants.find((item) => item.claimTokenHash === hash) ?? null : null;
    if (token && !viewer && group.status !== 'ARCHIVED') {
      throw new AppError(401, 'INVALID_CORO_PARTICIPANT_SESSION', 'La identidad del coro no es válida.');
    }
    return mapCoroDetail(group, viewer?.id ?? null);
  }

  async update(workspaceId: string, id: string, input: UpdateCoroGroupInput) {
    const group = await this.owned(workspaceId, id);
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    await prisma.coroGroup.update({ where: { id }, data: input });
    return this.detail(workspaceId, group.participants.find((item) => item.isOwner)!.profileId!, id);
  }

  async addParticipant(workspaceId: string, id: string, name: string) {
    const group = await this.owned(workspaceId, id);
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite participantes.');
    if (group.participants.length >= MAX_PARTICIPANTS) throw new AppError(409, 'CORO_PARTICIPANT_LIMIT', 'El coro alcanzó 50 participantes.');
    try {
      return await prisma.coroParticipant.create({
        data: { coroGroupId: id, name, normalizedName: normalizeCoroName(name) },
        select: { id: true, name: true, isOwner: true },
      });
    } catch { throw new AppError(409, 'CORO_PARTICIPANT_EXISTS', 'Ya existe un participante con ese nombre.'); }
  }

  async releaseClaim(workspaceId: string, id: string, participantId: string) {
    await this.owned(workspaceId, id);
    const result = await prisma.coroParticipant.updateMany({
      where: { id: participantId, coroGroupId: id, isOwner: false },
      data: { claimTokenHash: null, tokenCreatedAt: null, tokenRevokedAt: new Date(), paymentDetailsEncrypted: null },
    });
    if (!result.count) throw new AppError(404, 'CORO_PARTICIPANT_NOT_FOUND', 'Participante no encontrado.');
  }

  async updateParticipant(workspaceId: string, id: string, participantId: string, name: string) {
    const group = await this.owned(workspaceId, id);
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'Este coro ya no admite cambios.');
    const trimmed = name.trim();
    if (!trimmed) throw new AppError(400, 'INVALID_NAME', 'El nombre es obligatorio.');
    const existing = group.participants.find((p) => p.id === participantId);
    if (!existing) throw new AppError(404, 'CORO_PARTICIPANT_NOT_FOUND', 'Participante no encontrado.');
    try {
      return await prisma.coroParticipant.update({
        where: { id: participantId },
        data: { name: trimmed, normalizedName: normalizeCoroName(trimmed) },
        select: { id: true, name: true, isOwner: true },
      });
    } catch {
      throw new AppError(409, 'CORO_PARTICIPANT_EXISTS', 'Ya existe un participante con ese nombre.');
    }
  }

  async removeParticipant(workspaceId: string, id: string, participantId: string) {
    const group = await this.owned(workspaceId, id);
    if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'No se pueden eliminar participantes de un coro cerrado o archivado.');
    const target = group.participants.find((p) => p.id === participantId);
    if (!target) throw new AppError(404, 'CORO_PARTICIPANT_NOT_FOUND', 'Participante no encontrado.');
    if (target.isOwner) throw new AppError(400, 'CANNOT_REMOVE_OWNER', 'El anfitrión del coro no puede ser eliminado.');

    const activeExpenses = await prisma.coroExpense.findFirst({
      where: {
        coroGroupId: id, deletedAt: null,
        OR: [{ paidById: participantId }, { createdByParticipantId: participantId }, { splits: { some: { participantId } } }],
      },
      select: { id: true },
    });
    if (activeExpenses) throw new AppError(409, 'PARTICIPANT_HAS_EXPENSES', 'No puedes eliminar a este participante porque tiene gastos o divisiones asociadas.');

    const confirmedSettlements = await prisma.coroSettlement.findFirst({
      where: {
        coroGroupId: id, status: { in: ['MARKED_PAID', 'CONFIRMED'] },
        OR: [{ fromParticipantId: participantId }, { toParticipantId: participantId }],
      },
      select: { id: true },
    });
    if (confirmedSettlements) throw new AppError(409, 'PARTICIPANT_HAS_SETTLEMENTS', 'No puedes eliminar a un participante con transferencias confirmadas o marcadas como pagadas.');

    await prisma.$transaction(async (tx) => {
      await tx.coroSettlement.deleteMany({ where: { coroGroupId: id, OR: [{ fromParticipantId: participantId }, { toParticipantId: participantId }] } });
      await tx.coroExpenseSplit.deleteMany({ where: { participantId } });
      await tx.coroExpense.deleteMany({ where: { coroGroupId: id, deletedAt: { not: null }, OR: [{ paidById: participantId }, { createdByParticipantId: participantId }] } });
      await tx.coroParticipant.delete({ where: { id: participantId } });
    });
  }

  async claim(slug: string, input: ClaimCoroParticipantInput) {
    const credentials = createParticipantToken();
    try {
      const participant = await prisma.$transaction(async (tx) => {
        const group = await tx.coroGroup.findUnique({ where: { slug }, include: { participants: true } });
        if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
        if (group.status === 'ARCHIVED') throw new AppError(410, 'CORO_ARCHIVED', 'Este coro está archivado.');
        if (input.participantId) {
          const selected = group.participants.find((item) => item.id === input.participantId);
          if (!selected || normalizeCoroName(selected.name) !== normalizeCoroName(input.name)) {
            throw new AppError(404, 'CORO_PARTICIPANT_NOT_FOUND', 'Participante no encontrado.');
          }
          if (selected.profileId || selected.claimTokenHash) throw new AppError(409, 'CORO_PARTICIPANT_CLAIMED', 'Ese nombre ya fue reclamado.');
          const updated = await tx.coroParticipant.updateMany({
            where: { id: selected.id, claimTokenHash: null, profileId: null },
            data: { claimTokenHash: credentials.hash, tokenCreatedAt: new Date(), tokenRevokedAt: null },
          });
          if (!updated.count) throw new AppError(409, 'CORO_PARTICIPANT_CLAIMED', 'Ese nombre ya fue reclamado.');
          return selected.id;
        }
        if (group.status !== 'ACTIVE') throw new AppError(409, 'CORO_LOCKED', 'No se pueden añadir participantes después del cierre.');
        if (group.participants.length >= MAX_PARTICIPANTS) throw new AppError(409, 'CORO_PARTICIPANT_LIMIT', 'El coro alcanzó 50 participantes.');
        const created = await tx.coroParticipant.create({ data: {
          coroGroupId: group.id, name: input.name, normalizedName: normalizeCoroName(input.name),
          claimTokenHash: credentials.hash, tokenCreatedAt: new Date(),
        } });
        return created.id;
      }, { isolationLevel: 'Serializable' });
      logger.info('coro_participant_claimed', { participantId: participant });
      return { token: credentials.token, participantId: participant, detail: await this.publicDetail(slug, credentials.token) };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(409, 'CORO_PARTICIPANT_EXISTS', 'Ese nombre ya existe o acaba de ser reclamado.');
    }
  }

  async updatePayment(slug: string, token: string, payment: CoroPaymentDestination | null) {
    const group = await prisma.coroGroup.findUnique({ where: { slug } });
    if (!group) throw new AppError(404, 'CORO_NOT_FOUND', 'Coro no encontrado.');
    if (group.status === 'ARCHIVED') throw new AppError(410, 'CORO_ARCHIVED', 'Este coro está archivado.');
    const result = await prisma.coroParticipant.updateMany({
      where: { coroGroupId: group.id, claimTokenHash: hashParticipantToken(token) },
      data: { paymentDetailsEncrypted: payment ? SecretCryptoService.encrypt(JSON.stringify(payment)) : null },
    });
    if (!result.count) throw new AppError(401, 'INVALID_CORO_PARTICIPANT_SESSION', 'La identidad del coro no es válida.');
    return this.publicDetail(slug, token);
  }

  async updateOwnerPayment(workspaceId: string, profileId: string, id: string, payment: CoroPaymentDestination | null) {
    const group = await this.owned(workspaceId, id);
    if (group.status === 'ARCHIVED') throw new AppError(410, 'CORO_ARCHIVED', 'Este coro está archivado.');
    const owner = group.participants.find((item) => item.profileId === profileId && item.isOwner);
    if (!owner) throw new AppError(403, 'CORO_OWNER_REQUIRED', 'Anfitrión no encontrado.');
    await prisma.coroParticipant.update({ where: { id: owner.id }, data: {
      paymentDetailsEncrypted: payment ? SecretCryptoService.encrypt(JSON.stringify(payment)) : null,
    } });
    return this.detail(workspaceId, profileId, id);
  }
}
