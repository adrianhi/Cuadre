import { describe, expect, it, vi } from 'vitest';
import {
  BetaInviteService,
  type BetaFunnelMetrics,
  type BetaInviteDeliveryView,
  type BetaInviteRecord,
  type BetaInviteStore,
} from '../src/modules/auth/application/beta-invite.service';

const now = new Date('2026-09-13T12:00:00Z');
const baseInvite: BetaInviteRecord = {
  id: 'invite-1', email: 'user@example.com', code: 'existing_opaque_invite_code_12345',
  expiresAt: new Date('2026-09-27T12:00:00Z'), usedAt: null, trialDays: 30,
  emailDispatchVersion: 0, source: null, campaignCode: null,
};
const delivery: BetaInviteDeliveryView = {
  id: 'delivery-1', status: 'ACCEPTED', deliveryMode: 'AUDIT_LOG',
  providerMessageId: 'audit:delivery-1', errorCode: null, processedAt: now,
  nextAttemptAt: now, contextKey: 'dispatch:1',
};
const emptyMetrics: BetaFunnelMetrics = {
  interestedTotal: 0, interestedPending: 0, invitedTotal: 0, activatedTotal: 0,
  onboardingCompleted: 0, gmailConnectedUsers: 0, enabledBanks: 0, emailNotSent: 0,
  emailAudit: 0, emailAccepted: 0, emailDelivered: 0, emailPending: 0, emailFailed: 0,
  conversionPercent: 0,
};

function fixture(overrides: Partial<BetaInviteStore> = {}) {
  const store = {
    findOrCreate: vi.fn(async () => ({ ...baseInvite })),
    refreshLink: vi.fn(async () => ({ ...baseInvite, code: 'rotated_opaque_invite_code_67890',
      expiresAt: new Date('2026-09-27T12:00:00Z'), emailDispatchVersion: 1 })),
    advanceDispatch: vi.fn(async () => ({ ...baseInvite, emailDispatchVersion: 1 })),
    oldestPendingInterests: vi.fn(async () => []),
    funnelMetrics: vi.fn(async () => emptyMetrics),
    ...overrides,
  } as BetaInviteStore;
  const queue = {
    enqueueBetaInvite: vi.fn(async () => ({ id: delivery.id, created: true })),
    latestBetaInviteDelivery: vi.fn(async () => null),
    betaInviteDelivery: vi.fn(async () => delivery),
    suppressRetryableBetaInviteDeliveries: vi.fn(async () => 0),
  };
  const processor = { processNext: vi.fn(async () => ({ processed: true, accepted: true, mode: 'AUDIT_LOG' as const })) };
  const service = new BetaInviteService(store, queue, processor, 'https://cuadre.example');
  return { service, store, queue, processor };
}

describe('BetaInviteService', () => {
  it('normalizes an email and returns a link without queuing when email is disabled', async () => {
    const { service, store, queue } = fixture();
    const result = await service.inviteUser({ email: '  USER@Example.COM ', sendEmail: false, now });
    expect(store.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({ email: 'user@example.com', trialDays: 30 }));
    expect(result.activationUrl).toBe('https://cuadre.example/login?invite=existing_opaque_invite_code_12345');
    expect(queue.enqueueBetaInvite).not.toHaveBeenCalled();
  });

  it('queues versioned content and processes its first attempt', async () => {
    const { service, queue, processor } = fixture();
    const result = await service.inviteUser({ email: 'user@example.com', now });
    expect(queue.enqueueBetaInvite).toHaveBeenCalledWith(expect.objectContaining({
      betaInviteId: 'invite-1', contextKey: 'dispatch:1', recipient: 'user@example.com',
      subject: expect.stringContaining('beta privada'),
    }));
    expect(processor.processNext).toHaveBeenCalledWith('delivery-1', now);
    expect(result.firstAttemptAccepted).toBe(true);
  });

  it('does not enqueue an accepted delivery again without forceResend', async () => {
    const { service, queue } = fixture();
    vi.mocked(queue.latestBetaInviteDelivery).mockResolvedValue(delivery);
    const result = await service.inviteUser({ email: 'user@example.com', now });
    expect(queue.enqueueBetaInvite).not.toHaveBeenCalled();
    expect(result.firstAttemptAccepted).toBe(true);
  });

  it('rotates the link and creates a new dispatch when forceResend is set', async () => {
    const { service, store, queue } = fixture();
    vi.mocked(queue.latestBetaInviteDelivery).mockResolvedValue(delivery);
    const result = await service.inviteUser({ email: 'user@example.com', forceResend: true, now });
    expect(store.refreshLink).toHaveBeenCalledWith(expect.objectContaining({ incrementDispatch: true }));
    expect(queue.suppressRetryableBetaInviteDeliveries).toHaveBeenCalledWith('invite-1', now);
    expect(queue.enqueueBetaInvite).toHaveBeenCalledWith(expect.objectContaining({ contextKey: 'dispatch:1' }));
    expect(result.activationUrl).toContain('rotated_opaque_invite_code_67890');
  });

  it('requires an explicit resend when an already-sent link expired', async () => {
    const { service, store, queue } = fixture();
    vi.mocked(store.findOrCreate).mockResolvedValue({ ...baseInvite, expiresAt: new Date('2026-09-12T12:00:00Z') });
    vi.mocked(queue.latestBetaInviteDelivery).mockResolvedValue(delivery);
    await expect(service.inviteUser({ email: 'user@example.com', now }))
      .rejects.toThrow('BETA_INVITE_EXPIRED_USE_RESEND');
    expect(queue.enqueueBetaInvite).not.toHaveBeenCalled();
  });

  it('continues a waitlist batch after one recipient fails', async () => {
    const { service, store } = fixture({
      oldestPendingInterests: vi.fn(async () => [
        { email: 'bad@example.com', campaignCode: null },
        { email: 'good@example.com', campaignCode: 'campaign' },
      ]),
      findOrCreate: vi.fn()
        .mockRejectedValueOnce(new Error('database error'))
        .mockResolvedValueOnce({ ...baseInvite, email: 'good@example.com' }),
    });
    const result = await service.inviteBatchFromWaitlist(2);
    expect(result).toMatchObject({ selected: 2, accepted: 1, failed: 1 });
    expect(store.findOrCreate).toHaveBeenLastCalledWith(expect.objectContaining({
      email: 'good@example.com', source: 'WAITLIST', campaignCode: 'campaign',
    }));
  });
});
