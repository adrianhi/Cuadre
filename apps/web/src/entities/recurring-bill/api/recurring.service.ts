import {
  linkRecurringTransactionResponseSchema,
  recurringBillResponseSchema, recurringRadarResponseSchema,
  unlinkRecurringTransactionResponseSchema,
  type CreateRecurringBillInput, type RecurringBillDto, type RecurringRadarDto, type UpdateRecurringBillInput,
} from '@bills/contracts';
import { httpClient, parseResponse } from '@/shared/api';

export const recurringService = {
  async radar(currency: string, signal?: AbortSignal): Promise<RecurringRadarDto> {
    const response = await httpClient.get('/recurring', { params: { currency, window: 30 }, signal });
    return parseResponse(recurringRadarResponseSchema, response.data).data;
  },
  async create(input: CreateRecurringBillInput): Promise<RecurringBillDto> {
    const response = await httpClient.post('/recurring', input);
    return parseResponse(recurringBillResponseSchema, response.data).data;
  },
  async update(id: string, input: UpdateRecurringBillInput): Promise<RecurringBillDto> {
    const response = await httpClient.patch(`/recurring/${id}`, input);
    return parseResponse(recurringBillResponseSchema, response.data).data;
  },
  async acknowledgeAlert(id: string) {
    await httpClient.patch(`/recurring/alerts/${id}`, { acknowledged: true });
  },
  async linkTransaction(recurringBillId: string, transactionId: string): Promise<{ linked: boolean; recurringBillId: string; transactionId: string }> {
    const response = await httpClient.post(`/recurring/${recurringBillId}/link-transaction`, { transactionId });
    return parseResponse(linkRecurringTransactionResponseSchema, response.data).data;
  },
  async unlinkTransaction(recurringBillId: string, transactionId?: string): Promise<{ unlinked: boolean; recurringBillId: string }> {
    const response = await httpClient.post(`/recurring/${recurringBillId}/unlink-transaction`, { transactionId });
    return parseResponse(unlinkRecurringTransactionResponseSchema, response.data).data;
  },
};

