import { describe, expect, it } from 'vitest';
import type { Transaction } from './types';
import { groupTransactionsByDate, statusCode } from './selectors';

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1', externalId: 'external', cardLast4: null, cardType: null, rawMerchant: 'UBER', merchant: 'Uber',
  amount: 100, currency: 'DOP', status: 'Aprobada', statusCode: 'APPROVED', transactionType: 'Compra',
  financialRole: 'EXPENSE', financialRoleOrigin: 'SYSTEM', suggestedFinancialRole: null,
  category: 'Transporte', transactionDate: '2026-08-27T12:00:00.000Z', createdAt: '2026-08-27T12:00:00.000Z',
  ...overrides,
});

describe('transaction selectors', () => {
  it('uses the canonical status', () => {
    expect(statusCode(transaction({ statusCode: 'REVERSED' }))).toBe('REVERSED');
  });
  it('excludes reversed transactions from daily totals', () => {
    const [group] = groupTransactionsByDate([transaction(), transaction({ id: '2', statusCode: 'REVERSED', amount: 50 })]);
    expect(group.totalExpenseDOP).toBe(100);
    expect(group.transactions).toHaveLength(2);
  });
  it('keeps internal transfers visible without adding them to daily expense totals', () => {
    const internal = transaction({ id: '2', amount: 500, financialRole: 'INTERNAL_TRANSFER' });
    const [group] = groupTransactionsByDate([transaction(), internal]);
    expect(group.transactions).toHaveLength(2);
    expect(group.totalExpenseDOP).toBe(100);
  });
});
