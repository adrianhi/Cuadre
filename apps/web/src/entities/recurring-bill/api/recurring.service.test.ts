import { afterEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import { httpClient } from '@/shared/api';
import { recurringService } from './recurring.service';

const mock = new AxiosMockAdapter(httpClient);

afterEach(() => mock.reset());

describe('recurringService', () => {
  const billId = '11111111-1111-1111-1111-111111111111';
  const txId = '22222222-2222-2222-2222-222222222222';

  it('links a transaction to a recurring bill', async () => {
    mock.onPost(`/recurring/${billId}/link-transaction`).reply(200, {
      success: true,
      data: { linked: true, recurringBillId: billId, transactionId: txId },
    });

    const result = await recurringService.linkTransaction(billId, txId);
    expect(result).toEqual({ linked: true, recurringBillId: billId, transactionId: txId });
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ transactionId: txId });
  });

  it('unlinks a transaction from a recurring bill', async () => {
    mock.onPost(`/recurring/${billId}/unlink-transaction`).reply(200, {
      success: true,
      data: { unlinked: true, recurringBillId: billId },
    });

    const result = await recurringService.unlinkTransaction(billId, txId);
    expect(result).toEqual({ unlinked: true, recurringBillId: billId });
  });

  it('deletes a recurring bill', async () => {
    mock.onDelete(`/recurring/${billId}`).reply(200, {
      success: true,
      data: { deleted: true, id: billId },
    });

    const result = await recurringService.delete(billId);
    expect(result).toEqual({ deleted: true, id: billId });
  });
});

