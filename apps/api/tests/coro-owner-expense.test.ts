import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database';
import { PrismaCoroExpenseStore } from '../src/modules/coro/infrastructure/prisma-coro-expense.store';

vi.mock('../src/config/database', () => ({ prisma: {
  coroGroup: { findFirst: vi.fn() },
  coroExpense: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
} }));

const participants = [
  { id: 'owner-id', profileId: 'profile-id', isOwner: true },
  { id: 'guest-id', profileId: null, isOwner: false },
  { id: 'third-id', profileId: null, isOwner: false },
];
const group = { id: 'group-id', workspaceId: 'workspace-id', status: 'ACTIVE', currency: 'DOP', participants };
const input = {
  title: 'Peaje', amount: 100, paidById: 'guest-id', category: 'Transporte',
  expenseDate: '2026-09-20T12:00:00.000Z', notes: null,
  splitParticipantIds: participants.map((item) => item.id), allowPossibleDuplicate: false,
};
const groups = { detail: vi.fn(), publicDetail: vi.fn() };
const store = new PrismaCoroExpenseStore(groups as never);
const mocked = prisma as unknown as {
  coroGroup: { findFirst: ReturnType<typeof vi.fn> };
  coroExpense: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};

describe('PrismaCoroExpenseStore.createOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.coroGroup.findFirst.mockResolvedValue(group);
    mocked.coroExpense.count.mockResolvedValue(0);
    mocked.coroExpense.findMany.mockResolvedValue([]);
    mocked.coroExpense.create.mockResolvedValue({ id: 'expense-id' });
    groups.detail.mockResolvedValue({ id: 'group-id', totalAmount: 100 });
  });

  it('creates an owner-managed expense and splits residual cents deterministically', async () => {
    const result = await store.createOwner('workspace-id', 'profile-id', 'group-id', input);
    expect(result).toEqual({ id: 'group-id', totalAmount: 100 });
    const data = mocked.coroExpense.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ coroGroupId: 'group-id', paidById: 'guest-id',
      createdByParticipantId: 'owner-id', currency: 'DOP', category: 'Transporte' });
    expect(data.splits.create.map((item: { participantId: string; assignedAmount: unknown }) =>
      [item.participantId, Number(item.assignedAmount)])).toEqual([
      ['guest-id', 33.34], ['owner-id', 33.33], ['third-id', 33.33],
    ]);
    expect(groups.detail).toHaveBeenCalledWith('workspace-id', 'profile-id', 'group-id');
  });

  it.each([
    ['missing group', null, 'profile-id', 'CORO_NOT_FOUND'],
    ['locked group', { ...group, status: 'LOCKED' }, 'profile-id', 'CORO_LOCKED'],
    ['wrong host', group, 'different-profile', 'CORO_OWNER_REQUIRED'],
  ])('rejects %s', async (_, storedGroup, profileId, code) => {
    mocked.coroGroup.findFirst.mockResolvedValue(storedGroup);
    await expect(store.createOwner('workspace-id', profileId, 'group-id', input))
      .rejects.toMatchObject({ code });
    expect(mocked.coroExpense.create).not.toHaveBeenCalled();
  });

  it('rejects payers or split members outside the coro', async () => {
    await expect(store.createOwner('workspace-id', 'profile-id', 'group-id', { ...input, paidById: 'outsider' }))
      .rejects.toMatchObject({ code: 'INVALID_CORO_PARTICIPANT' });
    await expect(store.createOwner('workspace-id', 'profile-id', 'group-id', { ...input, splitParticipantIds: ['outsider'] }))
      .rejects.toMatchObject({ code: 'INVALID_CORO_PARTICIPANT' });
  });

  it('enforces the expense quota', async () => {
    mocked.coroExpense.count.mockResolvedValue(1_000);
    await expect(store.createOwner('workspace-id', 'profile-id', 'group-id', input))
      .rejects.toMatchObject({ code: 'CORO_EXPENSE_LIMIT' });
  });

  it('reports duplicates and accepts an explicit override', async () => {
    mocked.coroExpense.findMany.mockResolvedValue([{ id: 'old-id', title: 'Peaje', amount: 100,
      currency: 'DOP', expenseDate: new Date(input.expenseDate), paidBy: { name: 'Adrian' } }]);
    await expect(store.createOwner('workspace-id', 'profile-id', 'group-id', input))
      .rejects.toMatchObject({ code: 'POSSIBLE_DUPLICATE' });
    await store.createOwner('workspace-id', 'profile-id', 'group-id', { ...input, allowPossibleDuplicate: true });
    expect(mocked.coroExpense.create).toHaveBeenCalledOnce();
  });
});
