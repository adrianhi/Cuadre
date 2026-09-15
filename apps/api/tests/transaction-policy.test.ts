import { describe, expect, it } from 'vitest';
import {
  isExpenseMovement,
  isIncomeMovement,
  isInternalTransferMovement,
  resolveDateRange,
} from '../src/modules/transactions/domain/transaction-policy';

describe('transaction date ranges', () => {
  it('uses Santo Domingo calendar boundaries for a selected day', () => {
    const range = resolveDateRange(undefined, '2026-08-28', '2026-08-28');
    expect(range.gte?.toISOString()).toBe('2026-08-28T04:00:00.000Z');
    expect(range.lte?.toISOString()).toBe('2026-08-29T03:59:59.999Z');
  });

  it('uses Santo Domingo boundaries across a month rollover', () => {
    const range = resolveDateRange('2026-12');
    expect(range.gte?.toISOString()).toBe('2026-12-01T04:00:00.000Z');
    expect(range.lte?.toISOString()).toBe('2027-01-01T03:59:59.999Z');
  });
});

describe('transaction financial roles', () => {
  it('uses the persisted role before legacy labels', () => {
    const row = { financialRole: 'INTERNAL_TRANSFER' as const, transactionType: 'Compra', category: 'Supermercado' };
    expect(isInternalTransferMovement(row)).toBe(true);
    expect(isExpenseMovement(row)).toBe(false);
    expect(isIncomeMovement(row)).toBe(false);
  });

  it('keeps temporary compatibility with legacy classifications', () => {
    expect(isIncomeMovement({ transactionType: 'Transferencia Recibida' })).toBe(true);
    expect(isInternalTransferMovement({ category: 'Transferencias Propias' })).toBe(true);
    expect(isExpenseMovement({ transactionType: 'Compra', category: 'Otros' })).toBe(true);
  });
});
