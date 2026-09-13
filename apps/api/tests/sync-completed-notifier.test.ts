import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database';
import { SyncCompletedNotifier } from '../src/modules/ingestion/application/sync-completed-notifier';

vi.mock('../src/config/database', () => ({
  prisma: {
    workspaceMember: {
      findFirst: vi.fn(),
    },
    inboxInstitutionSubscription: {
      findMany: vi.fn(),
    },
  },
}));

describe('SyncCompletedNotifier', () => {
  const emailTransport = {
    sendEmail: vi.fn().mockResolvedValue({ accepted: true }),
  };
  const appUrl = 'https://cuadre.com.do';
  const notifier = new SyncCompletedNotifier(emailTransport, appUrl);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email when owner profile has email', async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue({
      workspaceId: 'w-1',
      profileId: 'p-1',
      role: 'OWNER',
      createdAt: new Date(),
      profile: {
        id: 'p-1',
        email: 'adrian@example.com',
        displayName: 'Adrian',
      },
    } as any);

    vi.mocked(prisma.inboxInstitutionSubscription.findMany).mockResolvedValue([
      {
        institution: { displayName: 'Banco BHD' },
        institutionCode: 'BHD',
      },
    ] as any);

    await notifier.notify('w-1', 'conn-1', { scanned: 25, created: 8 }, 'job-123');

    expect(emailTransport.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: 'adrian@example.com',
        subject: expect.stringContaining('🎉 Tus transacciones ya están listas'),
        idempotencyKey: 'cuadre/sync-completed/conn-1/job-123',
      })
    );
  });

  it('skips gracefully when owner has no email', async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue(null);

    await notifier.notify('w-1', 'conn-1', { scanned: 5, created: 0 });

    expect(emailTransport.sendEmail).not.toHaveBeenCalled();
  });

  it('catches and logs error without throwing if transport fails', async () => {
    vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValue({
      workspaceId: 'w-1',
      profileId: 'p-1',
      role: 'OWNER',
      profile: {
        id: 'p-1',
        email: 'adrian@example.com',
        displayName: 'Adrian',
      },
    } as any);

    vi.mocked(prisma.inboxInstitutionSubscription.findMany).mockResolvedValue([]);
    emailTransport.sendEmail.mockRejectedValueOnce(new Error('Resend network timeout'));

    await expect(notifier.notify('w-1', 'conn-1', { scanned: 1, created: 1 })).resolves.toBeUndefined();
  });
});
