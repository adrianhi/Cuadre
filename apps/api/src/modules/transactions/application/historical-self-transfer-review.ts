import { isPotentialSelfTransfer } from '../domain/self-transfer-matcher';

export interface HistoricalTransferRow {
  id: string;
  workspaceId: string | null;
  institutionCode: string;
  transactionDate: Date;
  amount: unknown;
  currency: string;
  transactionType: string;
  category: string;
  source: string;
  merchant: string;
  rawMerchant: string;
  financialRole: 'EXPENSE' | 'INCOME' | 'INTERNAL_TRANSFER';
  financialRoleOrigin: 'SYSTEM' | 'BANK_SIGNAL' | 'USER_RULE' | 'MANUAL' | 'MIGRATION';
  classificationVersion: number;
}

export interface HistoricalTransferCandidate {
  id: string;
  workspaceId: string;
  institutionCode: string;
  transactionDate: string;
  amount: number;
  currency: string;
  reason: 'OWNER_NAME_TOKEN_MATCH';
  classificationVersion: number;
}

export function findHistoricalSelfTransferCandidates(
  rows: HistoricalTransferRow[],
  ownersByWorkspace: ReadonlyMap<string, string[]>,
): HistoricalTransferCandidate[] {
  return rows.flatMap((row) => {
    if (!row.workspaceId || row.financialRole === 'INTERNAL_TRANSFER' || row.financialRoleOrigin === 'MANUAL') return [];
    if (!isPotentialSelfTransfer(row, ownersByWorkspace.get(row.workspaceId) || [])) return [];
    return [{
      id: row.id,
      workspaceId: row.workspaceId,
      institutionCode: row.institutionCode,
      transactionDate: row.transactionDate.toISOString(),
      amount: Number(row.amount),
      currency: row.currency,
      reason: 'OWNER_NAME_TOKEN_MATCH' as const,
      classificationVersion: row.classificationVersion,
    }];
  });
}

export function summarizeHistoricalCandidates(candidates: HistoricalTransferCandidate[]) {
  const byCurrency: Record<string, { count: number; amount: number }> = {};
  for (const candidate of candidates) {
    byCurrency[candidate.currency] ??= { count: 0, amount: 0 };
    byCurrency[candidate.currency].count += 1;
    byCurrency[candidate.currency].amount += candidate.amount;
  }
  for (const value of Object.values(byCurrency)) value.amount = Math.round(value.amount * 100) / 100;
  return { count: candidates.length, byCurrency };
}

export function assertReviewedIds(
  requestedIds: string[],
  rows: HistoricalTransferRow[],
  candidates: HistoricalTransferCandidate[],
  workspaceId?: string,
) {
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const candidatesById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const failures: Array<{ id: string; reason: string }> = [];
  const applicable: HistoricalTransferCandidate[] = [];
  const alreadyApplied: string[] = [];
  for (const id of requestedIds) {
    const row = rowsById.get(id);
    if (!row) failures.push({ id, reason: 'NOT_FOUND' });
    else if (workspaceId && row.workspaceId !== workspaceId) failures.push({ id, reason: 'OUTSIDE_WORKSPACE' });
    else if (row.financialRole === 'INTERNAL_TRANSFER') alreadyApplied.push(id);
    else if (row.financialRoleOrigin === 'MANUAL') failures.push({ id, reason: 'MANUAL_DECISION_PROTECTED' });
    else {
      const candidate = candidatesById.get(id);
      if (candidate) applicable.push(candidate);
      else failures.push({ id, reason: 'NOT_A_REVIEWED_CANDIDATE' });
    }
  }
  if (failures.length) {
    throw new Error(`No se puede aplicar la revisión: ${JSON.stringify(failures)}`);
  }
  return { applicable, alreadyApplied };
}
