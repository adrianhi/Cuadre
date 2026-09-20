import { describe, expect, it, vi } from 'vitest';
import { CoroService } from '../src/modules/coro/application/coro.service';

function stores() {
  const groups = {
    list: vi.fn(), create: vi.fn(), detail: vi.fn(), publicDetail: vi.fn(), update: vi.fn(),
    addParticipant: vi.fn(), updateParticipant: vi.fn(), removeParticipant: vi.fn(),
    releaseClaim: vi.fn(), claim: vi.fn(), updatePayment: vi.fn(), updateOwnerPayment: vi.fn(),
  };
  const expenses = { create: vi.fn(), createOwner: vi.fn(), updatePublic: vi.fn(), removePublic: vi.fn(), removeOwner: vi.fn(),
    updateOwner: vi.fn(), candidates: vi.fn(), link: vi.fn() };
  const settlements = { lock: vi.fn(), archive: vi.fn(), markPaid: vi.fn(), confirm: vi.fn(),
    confirmOwner: vi.fn(), markPaidOwner: vi.fn() };
  return { groups, expenses, settlements, service: new CoroService(groups, expenses, settlements) };
}

describe('CoroService authorization', () => {
  it('rejects workspace members from owner operations', () => {
    const { service } = stores();
    expect(() => service.list({ workspaceId: 'w-other', userId: 'u', email: 'u@test.com', role: 'MEMBER' }))
      .toThrowError(expect.objectContaining({ code: 'CORO_OWNER_REQUIRED', statusCode: 403 }));
  });

  it('passes the authenticated workspace to every owner query', async () => {
    const { service, groups } = stores(); groups.list.mockResolvedValue([]);
    await service.list({ workspaceId: 'workspace-a', userId: 'u', email: 'u@test.com', role: 'OWNER' });
    expect(groups.list).toHaveBeenCalledWith('workspace-a');
  });

  it('keeps public participant operations independent from workspace authentication', async () => {
    const { service, groups } = stores(); groups.claim.mockResolvedValue({ token: 'secret' });
    await service.claim('unguessable-slug', { name: 'Pedro' });
    expect(groups.claim).toHaveBeenCalledWith('unguessable-slug', { name: 'Pedro' });
  });

  it('authorizes and forwards owner-created expenses with workspace isolation', async () => {
    const { service, expenses } = stores();
    const input = { title: 'Peaje', amount: 100, paidById: 'participant-owner', category: 'Transporte',
      expenseDate: '2026-09-20T12:00:00.000Z', notes: null, splitParticipantIds: ['participant-owner'],
      allowPossibleDuplicate: false };
    expenses.createOwner.mockResolvedValue({ id: 'group-1' });
    await service.createOwnerExpense({ workspaceId: 'workspace-a', userId: 'profile-a', email: 'a@test.com', role: 'OWNER' }, 'group-1', input);
    expect(expenses.createOwner).toHaveBeenCalledWith('workspace-a', 'profile-a', 'group-1', input);
    expect(() => service.createOwnerExpense({ workspaceId: 'workspace-a', userId: 'profile-a', email: 'a@test.com', role: 'MEMBER' }, 'group-1', input))
      .toThrowError(expect.objectContaining({ code: 'CORO_OWNER_REQUIRED' }));
  });

  it('authorizes and forwards updateParticipant and removeParticipant', async () => {
    const { service, groups } = stores();
    groups.updateParticipant.mockResolvedValue({ id: 'p-1', name: 'Laura' });
    await service.updateParticipant({ workspaceId: 'workspace-a', userId: 'profile-a', email: 'a@test.com', role: 'OWNER' }, 'group-1', 'p-1', 'Laura');
    expect(groups.updateParticipant).toHaveBeenCalledWith('workspace-a', 'group-1', 'p-1', 'Laura');

    groups.removeParticipant.mockResolvedValue(undefined);
    await service.removeParticipant({ workspaceId: 'workspace-a', userId: 'profile-a', email: 'a@test.com', role: 'OWNER' }, 'group-1', 'p-1');
    expect(groups.removeParticipant).toHaveBeenCalledWith('workspace-a', 'group-1', 'p-1');

    expect(() => service.removeParticipant({ workspaceId: 'workspace-a', userId: 'profile-a', email: 'a@test.com', role: 'MEMBER' }, 'group-1', 'p-1'))
      .toThrowError(expect.objectContaining({ code: 'CORO_OWNER_REQUIRED' }));
  });
});
