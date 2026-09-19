import { describe, expect, it, vi } from 'vitest';
import { IngestionJobService } from '../src/modules/ingestion/infrastructure/ingestion-job.service';
import type { GmailJobHandlerRegistry } from '../src/modules/ingestion/application/gmail-job-handler.registry';
import type { IngestionScheduler } from '../src/modules/ingestion/infrastructure/ingestion-scheduler';
import type { SyncCompletedNotifier } from '../src/modules/ingestion/application/sync-completed-notifier';
import { InstitutionSelectionService } from '../src/modules/connections/infrastructure/institution-selection.service';
import { prisma } from '../src/config/database';

vi.mock('../src/config/database', () => ({
  prisma: {
    ingestionJob: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    inboxConnection: {
      update: vi.fn(),
    },
  },
}));

describe('IngestionJobService notification on completion', () => {
  it('calls notifier when GMAIL_INITIAL_BACKFILL succeeds with summary', async () => {
    const handlers = {
      execute: vi.fn().mockResolvedValue({
        scanned: 40,
        parsed: 15,
        created: 15,
        failed: 0,
      }),
    } as unknown as GmailJobHandlerRegistry;

    const scheduler = {} as IngestionScheduler;
    const notifier = {
      notify: vi.fn().mockResolvedValue(undefined),
    } as unknown as SyncCompletedNotifier;

    const service = new IngestionJobService(handlers, scheduler, notifier);

    vi.spyOn(InstitutionSelectionService, 'enabledCodes').mockResolvedValue(['BHD']);

    const candidate = {
      id: 'job-1',
      workspaceId: 'workspace-1',
      inboxConnectionId: 'inbox-1',
      type: 'GMAIL_INITIAL_BACKFILL' as const,
      status: 'PENDING' as const,
      attempts: 0,
      maxAttempts: 5,
      payload: {},
    };

    vi.mocked(prisma.ingestionJob.findFirst).mockResolvedValueOnce(candidate as any);
    vi.mocked(prisma.ingestionJob.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.ingestionJob.update).mockResolvedValue(candidate as any);

    const processed = await service.processNext(['job-1']);

    expect(processed).toBe(true);
    expect(handlers.execute).toHaveBeenCalledWith('GMAIL_INITIAL_BACKFILL', expect.anything());
    expect(notifier.notify).toHaveBeenCalledWith(
      'workspace-1',
      'inbox-1',
      expect.objectContaining({ scanned: 40, created: 15 }),
      'job-1'
    );
  });

  it('does not call notifier when job is GMAIL_HISTORY_SYNC', async () => {
    const handlers = {
      execute: vi.fn().mockResolvedValue({
        scanned: 1,
        created: 1,
      }),
    } as unknown as GmailJobHandlerRegistry;

    const scheduler = {} as IngestionScheduler;
    const notifier = {
      notify: vi.fn().mockResolvedValue(undefined),
    } as unknown as SyncCompletedNotifier;

    const service = new IngestionJobService(handlers, scheduler, notifier);

    vi.spyOn(InstitutionSelectionService, 'enabledCodes').mockResolvedValue(['BHD']);

    const candidate = {
      id: 'job-2',
      workspaceId: 'workspace-1',
      inboxConnectionId: 'inbox-1',
      type: 'GMAIL_HISTORY_SYNC' as const,
      status: 'PENDING' as const,
      attempts: 0,
      maxAttempts: 5,
      payload: {},
    };

    vi.mocked(prisma.ingestionJob.findFirst).mockResolvedValueOnce(candidate as any);
    vi.mocked(prisma.ingestionJob.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.ingestionJob.update).mockResolvedValue(candidate as any);

    await service.processNext(['job-2']);

    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it('signals work only after a durable enqueue succeeds', async () => {
    const onWorkAvailable = vi.fn();
    const service = new IngestionJobService(
      {} as GmailJobHandlerRegistry,
      {} as IngestionScheduler,
      undefined,
      onWorkAvailable,
    );
    vi.mocked(prisma.ingestionJob.upsert).mockResolvedValue({ status: 'PENDING' } as any);

    await service.enqueue({
      workspaceId: 'workspace-1', inboxConnectionId: 'inbox-1',
      type: 'GMAIL_RECONCILIATION', dedupeKey: 'job-1',
    });

    expect(onWorkAvailable).toHaveBeenCalledTimes(1);
  });

  it('does not signal work when enqueue fails', async () => {
    const onWorkAvailable = vi.fn();
    const service = new IngestionJobService(
      {} as GmailJobHandlerRegistry,
      {} as IngestionScheduler,
      undefined,
      onWorkAvailable,
    );
    vi.mocked(prisma.ingestionJob.upsert).mockRejectedValueOnce(new Error('database unavailable'));

    await expect(service.enqueue({
      workspaceId: 'workspace-1', inboxConnectionId: 'inbox-1',
      type: 'GMAIL_RECONCILIATION', dedupeKey: 'job-2',
    })).rejects.toThrow('database unavailable');
    expect(onWorkAvailable).not.toHaveBeenCalled();
  });
});
