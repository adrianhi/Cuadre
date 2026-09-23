import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteRecurringBillResponseSchema,
  linkRecurringTransactionSchema,
  linkRecurringTransactionResponseSchema,
  unlinkRecurringTransactionResponseSchema,
} from '@bills/contracts';
import { prisma } from '../src/config/database';
import { PrismaRecurringQuery } from '../src/modules/recurring/infrastructure/prisma-recurring-query';
import { RecurringService } from '../src/modules/recurring/application/recurring.service';
import type { RecurringActionRecorder, RecurringRepository } from '../src/modules/recurring/application/recurring.ports';

vi.mock('../src/config/database', () => ({
  prisma: {
    recurringBill: { findFirst: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
    transaction: { findFirst: vi.fn(), findMany: vi.fn() },
    recurringOccurrence: { upsert: vi.fn(), deleteMany: vi.fn() },
    recurringScanJob: { findUnique: vi.fn() },
    incomeStream: { findMany: vi.fn() },
  },
}));

const mockedPrisma = prisma as unknown as {
  recurringBill: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  transaction: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
  recurringOccurrence: { upsert: ReturnType<typeof vi.fn>; deleteMany: ReturnType<typeof vi.fn> };
  recurringScanJob: { findUnique: ReturnType<typeof vi.fn> };
  incomeStream: { findMany: ReturnType<typeof vi.fn> };
};

describe('recurring transaction linking', () => {
  const query = new PrismaRecurringQuery();
  const workspaceId = '00000000-0000-0000-0000-000000000001';
  const billId = '11111111-1111-1111-1111-111111111111';
  const txId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('linkRecurringTransaction contracts', () => {
    it('validates a valid uuid input', () => {
      const parsed = linkRecurringTransactionSchema.parse({ transactionId: txId });
      expect(parsed.transactionId).toBe(txId);
    });

    it('rejects invalid uuid inputs', () => {
      expect(() => linkRecurringTransactionSchema.parse({ transactionId: 'not-a-uuid' })).toThrow();
    });

    it('validates link and unlink response schemas', () => {
      const linkResp = linkRecurringTransactionResponseSchema.parse({
        success: true,
        data: { linked: true, recurringBillId: billId, transactionId: txId },
      });
      expect(linkResp.data.linked).toBe(true);

      const unlinkResp = unlinkRecurringTransactionResponseSchema.parse({
        success: true,
        data: { unlinked: true, recurringBillId: billId },
      });
      expect(unlinkResp.data.unlinked).toBe(true);

      const delResp = deleteRecurringBillResponseSchema.parse({
        success: true,
        data: { deleted: true, id: billId },
      });
      expect(delResp.data.deleted).toBe(true);
      expect(delResp.data.id).toBe(billId);
    });
  });

  describe('PrismaRecurringQuery.linkTransaction', () => {
    it('successfully links an approved transaction with matching currency', async () => {
      const txDate = new Date('2026-09-10T12:00:00Z');
      mockedPrisma.recurringBill.findFirst.mockResolvedValue({ id: billId, workspaceId, currency: 'DOP' });
      mockedPrisma.transaction.findFirst.mockResolvedValue({
        id: txId, workspaceId, statusCode: 'APPROVED', currency: 'DOP', amount: 1500, transactionDate: txDate,
      });
      mockedPrisma.recurringOccurrence.upsert.mockResolvedValue({ id: 'occ-1' });

      const result = await query.linkTransaction(workspaceId, billId, txId);
      expect(result).toEqual({ recurringBillId: billId, transactionId: txId });
      expect(mockedPrisma.recurringOccurrence.upsert).toHaveBeenCalledWith({
        where: { transactionId: txId },
        update: { recurringBillId: billId, amount: 1500, occurredAt: txDate },
        create: { recurringBillId: billId, transactionId: txId, amount: 1500, occurredAt: txDate },
      });
    });

    it('throws 404 when recurring bill does not exist in workspace', async () => {
      mockedPrisma.recurringBill.findFirst.mockResolvedValue(null);
      await expect(query.linkTransaction(workspaceId, billId, txId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'RECURRING_BILL_NOT_FOUND',
      });
      expect(mockedPrisma.recurringOccurrence.upsert).not.toHaveBeenCalled();
    });

    it('throws 400 when transaction is not approved or currency mismatches', async () => {
      mockedPrisma.recurringBill.findFirst.mockResolvedValue({ id: billId, workspaceId, currency: 'DOP' });
      mockedPrisma.transaction.findFirst.mockResolvedValue({
        id: txId, workspaceId, statusCode: 'PENDING', currency: 'DOP', amount: 1500,
      });
      await expect(query.linkTransaction(workspaceId, billId, txId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_RECURRING_TRANSACTION',
      });

      mockedPrisma.transaction.findFirst.mockResolvedValue({
        id: txId, workspaceId, statusCode: 'APPROVED', currency: 'USD', amount: 1500,
      });
      await expect(query.linkTransaction(workspaceId, billId, txId)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_RECURRING_TRANSACTION',
      });
    });
  });

  describe('PrismaRecurringQuery.unlinkTransaction', () => {
    it('deletes occurrences by bill and optional transaction id', async () => {
      mockedPrisma.recurringBill.findFirst.mockResolvedValue({ id: billId, workspaceId });
      mockedPrisma.recurringOccurrence.deleteMany.mockResolvedValue({ count: 1 });

      const unlinkedOne = await query.unlinkTransaction(workspaceId, billId, txId);
      expect(unlinkedOne).toBe(true);
      expect(mockedPrisma.recurringOccurrence.deleteMany).toHaveBeenCalledWith({
        where: { recurringBillId: billId, transactionId: txId },
      });

      const unlinkedAll = await query.unlinkTransaction(workspaceId, billId);
      expect(unlinkedAll).toBe(true);
      expect(mockedPrisma.recurringOccurrence.deleteMany).toHaveBeenCalledWith({
        where: { recurringBillId: billId },
      });
    });

    it('throws 404 when recurring bill does not exist in workspace', async () => {
      mockedPrisma.recurringBill.findFirst.mockResolvedValue(null);
      await expect(query.unlinkTransaction(workspaceId, billId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'RECURRING_BILL_NOT_FOUND',
      });
    });
  });

  describe('PrismaRecurringQuery.delete', () => {
    it('deletes recurring bill and throws 404 when missing', async () => {
      mockedPrisma.recurringBill.findFirst.mockResolvedValue({ id: billId, workspaceId });
      mockedPrisma.recurringBill.delete.mockResolvedValue({ id: billId });

      expect(await query.delete(workspaceId, billId)).toBe(true);
      expect(mockedPrisma.recurringBill.delete).toHaveBeenCalledWith({ where: { id: billId } });

      mockedPrisma.recurringBill.findFirst.mockResolvedValue(null);
      await expect(query.delete(workspaceId, billId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'RECURRING_BILL_NOT_FOUND',
      });
    });
  });

  describe('Radar inclusion with linked transaction', () => {
    it('includes explicit linked transaction details in radar', async () => {
      const explicitDate = new Date('2026-09-08T15:00:00.000-04:00');
      mockedPrisma.recurringBill.findMany.mockResolvedValue([
        {
          id: billId, displayName: 'Internet Starlink', currency: 'DOP', cadence: 'MONTHLY',
          expectedAmount: 3500, nextExpectedDate: new Date('2026-09-15T00:00:00-04:00'),
          lastSeenAt: new Date('2026-08-15T00:00:00-04:00'), occurrenceCount: 3, confidence: 0.9,
          status: 'CONFIRMED', userEditedAt: null, identityKey: 'internet starlink',
          alerts: [],
          occurrences: [
            {
              transaction: {
                id: txId, merchant: 'Starlink Internet Services', amount: 3500, transactionDate: explicitDate,
              },
            },
          ],
        },
      ]);
      mockedPrisma.recurringScanJob.findUnique.mockResolvedValue({ status: 'READY' });
      mockedPrisma.incomeStream.findMany.mockResolvedValue([]);
      mockedPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await query.radar(workspaceId, 'DOP', 30);
      expect(result.allConfirmed).toHaveLength(1);
      const item = result.allConfirmed[0];
      expect(item.linkedTransactionId).toBe(txId);
      expect(item.linkedTransactionName).toBe('Starlink Internet Services');
      expect(item.monthStatus).toBe('PAID');
      expect(item.lastPaidAmount).toBe(3500);
      expect(result.paidThisMonth).toBe(3500);
    });
  });

  describe('RecurringService events', () => {
    it('records actions when linking, unlinking, and deleting', async () => {
      const repository: RecurringRepository = {
        ensureScanScheduled: vi.fn(),
        radar: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(true),
        acknowledgeAlert: vi.fn(),
        sumFutureThroughMonthEnd: vi.fn(),
        sumFutureThrough: vi.fn(),
        candidates: vi.fn(),
        observations: vi.fn(),
        saveDetection: vi.fn(),
        linkTransaction: vi.fn().mockResolvedValue({ recurringBillId: billId, transactionId: txId }),
        unlinkTransaction: vi.fn().mockResolvedValue(true),
      };
      const events: RecurringActionRecorder = { recordAction: vi.fn() };
      const service = new RecurringService(repository, events);

      await service.linkTransaction(workspaceId, 'profile-1', billId, txId);
      expect(repository.linkTransaction).toHaveBeenCalledWith(workspaceId, billId, txId);
      expect(events.recordAction).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId, profileId: 'profile-1', name: 'RECURRING_TRANSACTION_LINKED',
      }));

      await service.unlinkTransaction(workspaceId, 'profile-1', billId, txId);
      expect(repository.unlinkTransaction).toHaveBeenCalledWith(workspaceId, billId, txId);
      expect(events.recordAction).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId, profileId: 'profile-1', name: 'RECURRING_TRANSACTION_UNLINKED',
      }));

      await service.delete(workspaceId, 'profile-1', billId);
      expect(repository.delete).toHaveBeenCalledWith(workspaceId, billId);
      expect(events.recordAction).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId, profileId: 'profile-1', name: 'RECURRING_DELETED', contextKey: `${billId}:deleted`,
      }));
    });
  });
});
