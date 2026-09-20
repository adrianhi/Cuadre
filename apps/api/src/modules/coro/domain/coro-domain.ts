import crypto from 'node:crypto';

export interface CoroBalance { participantId: string; paidCents: number; owedCents: number; netCents: number }
export interface CoroTransfer { fromId: string; toId: string; amountCents: number }
export interface CoroExpenseValue {
  id: string; title: string; amountCents: number; currency: string; expenseDate: Date;
  paidById: string; splits: Array<{ participantId: string; amountCents: number }>;
}

const STOP_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'en', 'por', 'para']);

export function normalizeCoroName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function createCoroSlug(name: string): string {
  const prefix = normalizeCoroName(name).replaceAll(' ', '-').slice(0, 36) || 'coro';
  return `${prefix}-${crypto.randomBytes(16).toString('base64url')}`;
}

export function createParticipantToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashParticipantToken(token) };
}

export function hashParticipantToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function splitAmountCents(totalCents: number, participantIds: string[]) {
  const ids = [...new Set(participantIds)].sort();
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || ids.length === 0) {
    throw new Error('INVALID_CORO_SPLIT');
  }
  const base = Math.floor(totalCents / ids.length);
  let remainder = totalCents - base * ids.length;
  return ids.map((participantId) => ({
    participantId,
    amountCents: base + (remainder-- > 0 ? 1 : 0),
  }));
}

export function calculateBalances(participantIds: string[], expenses: CoroExpenseValue[]): CoroBalance[] {
  const balances = new Map(participantIds.map((participantId) => [participantId,
    { participantId, paidCents: 0, owedCents: 0, netCents: 0 }]));
  for (const expense of expenses) {
    const payer = balances.get(expense.paidById);
    if (!payer) throw new Error('INVALID_CORO_PAYER');
    payer.paidCents += expense.amountCents;
    for (const split of expense.splits) {
      const participant = balances.get(split.participantId);
      if (!participant) throw new Error('INVALID_CORO_SPLIT_PARTICIPANT');
      participant.owedCents += split.amountCents;
    }
  }
  for (const balance of balances.values()) balance.netCents = balance.paidCents - balance.owedCents;
  return [...balances.values()].sort((a, b) => a.participantId.localeCompare(b.participantId));
}

export function simplifyBalances(balances: Array<Pick<CoroBalance, 'participantId' | 'netCents'>>): CoroTransfer[] {
  const creditors = balances.filter((item) => item.netCents > 0)
    .map((item) => ({ id: item.participantId, cents: item.netCents }));
  const debtors = balances.filter((item) => item.netCents < 0)
    .map((item) => ({ id: item.participantId, cents: -item.netCents }));
  const order = (a: { id: string; cents: number }, b: { id: string; cents: number }) =>
    b.cents - a.cents || a.id.localeCompare(b.id);
  const result: CoroTransfer[] = [];
  while (creditors.length && debtors.length) {
    creditors.sort(order); debtors.sort(order);
    const creditor = creditors[0]; const debtor = debtors[0];
    const amountCents = Math.min(creditor.cents, debtor.cents);
    result.push({ fromId: debtor.id, toId: creditor.id, amountCents });
    creditor.cents -= amountCents; debtor.cents -= amountCents;
    if (creditor.cents === 0) creditors.shift();
    if (debtor.cents === 0) debtors.shift();
  }
  if (creditors.some((item) => item.cents) || debtors.some((item) => item.cents)) {
    throw new Error('UNBALANCED_CORO');
  }
  return result;
}

function meaningfulTokens(value: string): Set<string> {
  return new Set(normalizeCoroName(value).split(' ').filter((token) => token.length >= 4 && !STOP_WORDS.has(token)));
}

export function isPotentialDuplicate(
  candidate: Pick<CoroExpenseValue, 'title' | 'amountCents' | 'currency' | 'expenseDate'>,
  input: Pick<CoroExpenseValue, 'title' | 'amountCents' | 'currency' | 'expenseDate'>,
): boolean {
  if (candidate.currency !== input.currency) return false;
  if (Math.abs(candidate.expenseDate.getTime() - input.expenseDate.getTime()) > 86_400_000) return false;
  if (Math.abs(candidate.amountCents - input.amountCents) > Math.max(1, input.amountCents * 0.05)) return false;
  const left = normalizeCoroName(candidate.title); const right = normalizeCoroName(input.title);
  if (left === right) return true;
  const candidateTokens = meaningfulTokens(candidate.title); const inputTokens = meaningfulTokens(input.title);
  return [...candidateTokens].some((token) => inputTokens.has(token));
}
