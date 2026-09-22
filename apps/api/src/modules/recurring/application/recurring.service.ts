import type { CreateRecurringBillInput, UpdateRecurringBillInput } from '@bills/contracts';
import type { RecurringActionRecorder, RecurringRepository } from './recurring.ports';

export class RecurringService {
  constructor(private readonly repository: RecurringRepository, private readonly events?: RecurringActionRecorder) {}

  async radar(workspaceId: string, currency: 'DOP' | 'USD', window: number) {
    await this.repository.ensureScanScheduled(workspaceId);
    return this.repository.radar(workspaceId, currency, window);
  }

  async create(workspaceId: string, profileId: string, input: CreateRecurringBillInput) {
    const result = await this.repository.create(workspaceId, input);
    await this.events?.recordAction({
      workspaceId, profileId,
      name: 'RECURRING_CREATED',
      contextKey: `${result.id}:manual`,
      properties: { currency: result.currency, status: result.status },
    });
    return result;
  }

  async update(workspaceId: string, profileId: string, id: string, input: UpdateRecurringBillInput) {
    const result = await this.repository.update(workspaceId, id, input);
    if (result) await this.events?.recordAction({
      workspaceId, profileId,
      name: input.status === 'CONFIRMED' ? 'RECURRING_CONFIRMED' : 'RECURRING_EDITED',
      contextKey: `${id}:${input.status || 'details'}`,
      properties: { currency: result.currency, status: result.status },
    });
    return result;
  }

  acknowledgeAlert(workspaceId: string, id: string) {
    return this.repository.acknowledgeAlert(workspaceId, id);
  }

  sumFutureThroughMonthEnd(workspaceId: string, currency: string, today: string) {
    return this.repository.sumFutureThroughMonthEnd(workspaceId, currency, today);
  }

  sumFutureThrough(workspaceId: string, currency: string, after: string, through: string) {
    return this.repository.sumFutureThrough(workspaceId, currency, after, through);
  }

  async linkTransaction(workspaceId: string, profileId: string, recurringBillId: string, transactionId: string) {
    const result = await this.repository.linkTransaction(workspaceId, recurringBillId, transactionId);
    await this.events?.recordAction({
      workspaceId, profileId,
      name: 'RECURRING_TRANSACTION_LINKED',
      contextKey: `${recurringBillId}:${transactionId}`,
      properties: { recurringBillId, transactionId },
    });
    return result;
  }

  async unlinkTransaction(workspaceId: string, profileId: string, recurringBillId: string, transactionId?: string) {
    const result = await this.repository.unlinkTransaction(workspaceId, recurringBillId, transactionId);
    await this.events?.recordAction({
      workspaceId, profileId,
      name: 'RECURRING_TRANSACTION_UNLINKED',
      contextKey: `${recurringBillId}:${transactionId ?? 'all'}`,
      properties: { recurringBillId, ...(transactionId ? { transactionId } : {}) },
    });
    return result;
  }
}
