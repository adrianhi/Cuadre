import { describe, expect, it, vi } from 'vitest';
import { CoroService } from '../src/modules/coro/application/coro.service';

function stores() {
  const groups = {
    list: vi.fn(), create: vi.fn(), detail: vi.fn(), publicDetail: vi.fn(), update: vi.fn(),
    addParticipant: vi.fn(), releaseClaim: vi.fn(), claim: vi.fn(), updatePayment: vi.fn(), updateOwnerPayment: vi.fn(),
  };
  const expenses = { create: vi.fn(), updatePublic: vi.fn(), removePublic: vi.fn(), removeOwner: vi.fn(),
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
});
