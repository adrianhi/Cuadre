import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncCompletedNotifier } from '../src/modules/ingestion/application/sync-completed-notifier';

describe('SyncCompletedNotifier', () => {
  const emailTransport = {
    sendEmail: vi.fn().mockResolvedValue({ accepted: true }),
  };
  const contextReader = { find: vi.fn() };
  const appUrl = 'https://cuadre.com.do';
  const notifier = new SyncCompletedNotifier(emailTransport, contextReader, appUrl);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email when owner profile has email', async () => {
    contextReader.find.mockResolvedValue({
      recipient: 'adrian@example.com', userDisplayName: 'Adrian', institutions: ['Banco BHD'],
    });

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
    contextReader.find.mockResolvedValue(null);

    await notifier.notify('w-1', 'conn-1', { scanned: 5, created: 0 });

    expect(emailTransport.sendEmail).not.toHaveBeenCalled();
  });

  it('catches and logs error without throwing if transport fails', async () => {
    contextReader.find.mockResolvedValue({
      recipient: 'adrian@example.com', userDisplayName: 'Adrian', institutions: [],
    });
    emailTransport.sendEmail.mockRejectedValueOnce(new Error('Resend network timeout'));

    await expect(notifier.notify('w-1', 'conn-1', { scanned: 1, created: 1 })).resolves.toBeUndefined();
  });
});
