import { describe, expect, it } from 'vitest';
import {
  assertReviewedIds,
  findHistoricalSelfTransferCandidates,
  summarizeHistoricalCandidates,
  type HistoricalTransferRow,
} from '../src/modules/transactions/application/historical-self-transfer-review';

const row = (overrides: Partial<HistoricalTransferRow> = {}): HistoricalTransferRow => ({
  id: 'tx-1', workspaceId: 'workspace-1', institutionCode: 'BHD',
  transactionDate: new Date('2026-09-01T12:00:00Z'), amount: 4200, currency: 'DOP',
  transactionType: 'Transferencia enviada', category: 'Transferencias', source: 'BHD_TRANSFER_SENT',
  merchant: 'Adrian Joel Hidalgo', rawMerchant: 'ADRIAN JOEL HIDALGO', financialRole: 'EXPENSE',
  financialRoleOrigin: 'SYSTEM', classificationVersion: 2, ...overrides,
});

describe('historical internal transfer review', () => {
  it('finds conservative candidates and summarizes amounts without names', () => {
    const candidates = findHistoricalSelfTransferCandidates([row()], new Map([['workspace-1', ['Adrián Hidalgo']]]));
    expect(candidates).toEqual([expect.objectContaining({ id: 'tx-1', reason: 'OWNER_NAME_TOKEN_MATCH' })]);
    expect(JSON.stringify(candidates)).not.toContain('Adrian');
    expect(summarizeHistoricalCandidates(candidates)).toEqual({ count: 1, byCurrency: { DOP: { count: 1, amount: 4200 } } });
  });

  it('protects manual decisions and rejects ids outside the selected workspace', () => {
    expect(() => assertReviewedIds(['tx-1'], [row({ financialRoleOrigin: 'MANUAL' })], [], 'workspace-1'))
      .toThrow('MANUAL_DECISION_PROTECTED');
    expect(() => assertReviewedIds(['tx-1'], [row()], [], 'workspace-2')).toThrow('OUTSIDE_WORKSPACE');
  });

  it('treats already-applied ids as idempotent', () => {
    const applied = row({ financialRole: 'INTERNAL_TRANSFER', financialRoleOrigin: 'MIGRATION' });
    expect(assertReviewedIds(['tx-1'], [applied], [], 'workspace-1')).toEqual({ applicable: [], alreadyApplied: ['tx-1'] });
  });
});
