import type { Prisma } from '@prisma/client';

export function hiddenIncomeWhere(): Prisma.TransactionWhereInput {
  return { financialRole: 'INCOME', suggestedFinancialRole: null };
}

export function visibleTransactionWhere(): Prisma.TransactionWhereInput {
  return {
    NOT: hiddenIncomeWhere(),
    deletedAt: null,
  };
}

export function expenseTransactionWhere(): Prisma.TransactionWhereInput {
  return { financialRole: 'EXPENSE', deletedAt: null };
}
