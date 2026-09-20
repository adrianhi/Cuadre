import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database';
import { PrismaCoroGroupStore } from '../src/modules/coro/infrastructure/prisma-coro-group.store';

vi.mock('../src/config/database', () => ({
  prisma: {
    coroGroup: { findFirst: vi.fn() },
    coroParticipant: { update: vi.fn(), delete: vi.fn() },
    coroExpense: { findFirst: vi.fn(), deleteMany: vi.fn() },
    coroSettlement: { findFirst: vi.fn(), deleteMany: vi.fn() },
    coroExpenseSplit: { deleteMany: vi.fn() },
    $transaction: vi.fn(async (cb) => cb(prisma)),
  },
}));

const participants = [
  { id: 'owner-id', profileId: 'profile-id', name: 'Adrian', normalizedName: 'adrian', isOwner: true },
  { id: 'guest-id', profileId: null, name: 'Pedro', normalizedName: 'pedro', isOwner: false },
];
const group = { id: 'group-id', workspaceId: 'workspace-id', status: 'ACTIVE', participants };
const store = new PrismaCoroGroupStore();
const mocked = prisma as unknown as {
  coroGroup: { findFirst: ReturnType<typeof vi.fn> };
  coroParticipant: { update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  coroExpense: { findFirst: ReturnType<typeof vi.fn>; deleteMany: ReturnType<typeof vi.fn> };
  coroSettlement: { findFirst: ReturnType<typeof vi.fn>; deleteMany: ReturnType<typeof vi.fn> };
  coroExpenseSplit: { deleteMany: ReturnType<typeof vi.fn> };
};

describe('PrismaCoroGroupStore participant management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.coroGroup.findFirst.mockResolvedValue(group);
    mocked.coroExpense.findFirst.mockResolvedValue(null);
    mocked.coroSettlement.findFirst.mockResolvedValue(null);
    mocked.coroParticipant.update.mockResolvedValue({ id: 'guest-id', name: 'Carlos', isOwner: false });
  });

  describe('updateParticipant', () => {
    it('updates participant name and normalizes it', async () => {
      const res = await store.updateParticipant('workspace-id', 'group-id', 'guest-id', 'Carlos');
      expect(res).toEqual({ id: 'guest-id', name: 'Carlos', isOwner: false });
      expect(mocked.coroParticipant.update).toHaveBeenCalledWith({
        where: { id: 'guest-id' },
        data: { name: 'Carlos', normalizedName: 'carlos' },
        select: { id: true, name: true, isOwner: true },
      });
    });

    it('rejects empty names', async () => {
      await expect(store.updateParticipant('workspace-id', 'group-id', 'guest-id', '   '))
        .rejects.toMatchObject({ code: 'INVALID_NAME' });
    });

    it('rejects updates on locked coros', async () => {
      mocked.coroGroup.findFirst.mockResolvedValue({ ...group, status: 'LOCKED' });
      await expect(store.updateParticipant('workspace-id', 'group-id', 'guest-id', 'Carlos'))
        .rejects.toMatchObject({ code: 'CORO_LOCKED' });
    });

    it('rejects unknown participants', async () => {
      await expect(store.updateParticipant('workspace-id', 'group-id', 'unknown-id', 'Carlos'))
        .rejects.toMatchObject({ code: 'CORO_PARTICIPANT_NOT_FOUND' });
    });

    it('converts collision errors to 409', async () => {
      mocked.coroParticipant.update.mockRejectedValue(new Error('Unique constraint violation'));
      await expect(store.updateParticipant('workspace-id', 'group-id', 'guest-id', 'Adrian'))
        .rejects.toMatchObject({ code: 'CORO_PARTICIPANT_EXISTS' });
    });
  });

  describe('removeParticipant', () => {
    it('prevents removing the owner', async () => {
      await expect(store.removeParticipant('workspace-id', 'group-id', 'owner-id'))
        .rejects.toMatchObject({ code: 'CANNOT_REMOVE_OWNER' });
      expect(mocked.coroParticipant.delete).not.toHaveBeenCalled();
    });

    it('prevents removing participant with active expenses', async () => {
      mocked.coroExpense.findFirst.mockResolvedValue({ id: 'expense-1' });
      await expect(store.removeParticipant('workspace-id', 'group-id', 'guest-id'))
        .rejects.toMatchObject({ code: 'PARTICIPANT_HAS_EXPENSES' });
      expect(mocked.coroParticipant.delete).not.toHaveBeenCalled();
    });

    it('prevents removing participant with confirmed settlements', async () => {
      mocked.coroSettlement.findFirst.mockResolvedValue({ id: 'settlement-1' });
      await expect(store.removeParticipant('workspace-id', 'group-id', 'guest-id'))
        .rejects.toMatchObject({ code: 'PARTICIPANT_HAS_SETTLEMENTS' });
      expect(mocked.coroParticipant.delete).not.toHaveBeenCalled();
    });

    it('safely deletes clean participant and related draft artifacts', async () => {
      await store.removeParticipant('workspace-id', 'group-id', 'guest-id');
      expect(mocked.coroSettlement.deleteMany).toHaveBeenCalledWith({
        where: { coroGroupId: 'group-id', OR: [{ fromParticipantId: 'guest-id' }, { toParticipantId: 'guest-id' }] },
      });
      expect(mocked.coroExpenseSplit.deleteMany).toHaveBeenCalledWith({
        where: { participantId: 'guest-id' },
      });
      expect(mocked.coroParticipant.delete).toHaveBeenCalledWith({
        where: { id: 'guest-id' },
      });
    });
  });
});
