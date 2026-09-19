import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database';
import { PrismaRuleApplicationUnit } from '../src/modules/categorization/infrastructure/prisma-rule-application.unit';

vi.mock('../src/config/database', () => ({ prisma: { $transaction: vi.fn() } }));
vi.mock('../src/modules/categorization/infrastructure/workspace-rule-lock', () => ({
  lockRuleWorkspace: vi.fn().mockResolvedValue(undefined),
}));

const tx = {
  categoryRule: { findMany: vi.fn() },
  ruleApplication: {
    count: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  tx.ruleApplication.create.mockResolvedValue({ id: 'job-1' });
  tx.ruleApplication.updateMany.mockResolvedValue({ count: 1 });
  vi.mocked(prisma.$transaction).mockImplementation(async (work: any) => work(tx));
});

describe('PrismaRuleApplicationUnit work notifications', () => {
  it('notifies once after a transaction that creates and requeues work commits', async () => {
    const onWorkAvailable = vi.fn();
    const unit = new PrismaRuleApplicationUnit(onWorkAvailable);
    vi.mocked(prisma.$transaction).mockImplementation(async (work: any) => {
      const result = await work(tx);
      expect(onWorkAvailable).not.toHaveBeenCalled();
      return result;
    });

    await unit.run('workspace-1', async (session) => {
      const id = await session.create('rule-1', { includeUnknown: false }, [], 'fingerprint');
      await session.queue(id, 'APPLY');
    });

    expect(onWorkAvailable).toHaveBeenCalledTimes(1);
  });

  it('does not notify when the transaction rolls back', async () => {
    const onWorkAvailable = vi.fn();
    const unit = new PrismaRuleApplicationUnit(onWorkAvailable);
    vi.mocked(prisma.$transaction).mockImplementation(async (work: any) => {
      await work(tx);
      throw new Error('rollback');
    });

    await expect(unit.run('workspace-1', async (session) => {
      await session.create('rule-1', { includeUnknown: false }, [], 'fingerprint');
    })).rejects.toThrow('rollback');
    expect(onWorkAvailable).not.toHaveBeenCalled();
  });
});
