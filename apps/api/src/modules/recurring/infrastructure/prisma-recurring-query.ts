import type { CreateRecurringBillInput, RecurringBillDto, RecurringMonthStatus, RecurringRadarDto, UpdateRecurringBillInput } from '@bills/contracts';
import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';
import { expenseTransactionWhere } from '../../transactions';
import { projectTotalMonthlyIncome } from '../../incomes';
import { daysFrom, monthlyBurden, parseDateOnly, projectedDates, toDateOnly } from '../domain/recurring-projection';
import { recurringDto, round, santoDomingoToday } from './recurring-dto.mapper';

export class PrismaRecurringQuery {
  async ensureScanScheduled(workspaceId: string) {
    await prisma.recurringScanJob.upsert({
      where: { workspaceId }, update: {}, create: { workspaceId },
    });
  }

  async create(workspaceId: string, input: CreateRecurringBillInput): Promise<RecurringBillDto> {
    const today = santoDomingoToday();
    const identityKey = input.displayName.trim().toLocaleLowerCase('es');
    const parsedDate = parseDateOnly(input.nextExpectedDate);

    const bill = await prisma.recurringBill.upsert({
      where: { workspaceId_identityKey_currency: { workspaceId, identityKey, currency: input.currency } },
      create: {
        workspaceId, identityKey, displayName: input.displayName.trim(),
        currency: input.currency, cadence: input.cadence, expectedAmount: input.expectedAmount,
        nextExpectedDate: parsedDate, lastSeenAt: new Date(), occurrenceCount: 1, confidence: 1.0, status: 'CONFIRMED', userEditedAt: new Date(),
      },
      update: {
        displayName: input.displayName.trim(), cadence: input.cadence, expectedAmount: input.expectedAmount,
        nextExpectedDate: parsedDate, status: 'CONFIRMED', userEditedAt: new Date(),
      },
      include: { alerts: { where: { acknowledgedAt: null }, orderBy: { createdAt: 'desc' } } },
    });

    return recurringDto(bill, today, { monthStatus: 'UPCOMING' });
  }

  async radar(workspaceId: string, currency: 'DOP' | 'USD', window: number): Promise<RecurringRadarDto> {
    const today = santoDomingoToday();
    const currentMonthPrefix = today.slice(0, 7);
    const [currentYear, currentMonth] = currentMonthPrefix.split('-').map(Number);
    const startOfMonth = new Date(`${currentMonthPrefix}-01T00:00:00.000-04:00`);
    const lastDay = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();
    const endOfMonth = new Date(`${currentMonthPrefix}-${String(lastDay).padStart(2, '0')}T23:59:59.999-04:00`);

    const [bills, job, incomeStreams, monthTransactions] = await Promise.all([
      prisma.recurringBill.findMany({
        where: { workspaceId, currency, status: { not: 'DISMISSED' } },
        include: {
          alerts: { where: { acknowledgedAt: null }, orderBy: { createdAt: 'desc' } },
          occurrences: {
            where: { occurredAt: { gte: startOfMonth, lte: endOfMonth } },
            include: { transaction: { select: { id: true, merchant: true, amount: true, transactionDate: true } } },
            orderBy: { occurredAt: 'desc' }, take: 1,
          },
        },
        orderBy: [{ nextExpectedDate: 'asc' }, { displayName: 'asc' }],
      }),
      prisma.recurringScanJob.findUnique({ where: { workspaceId } }),
      prisma.incomeStream.findMany({ where: { workspaceId, currency, isActive: true } }),
      prisma.transaction.findMany({
        where: {
          workspaceId, currency, statusCode: 'APPROVED', ...expenseTransactionWhere(),
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { id: true, merchant: true, merchantKey: true, amount: true, transactionDate: true },
        orderBy: { transactionDate: 'desc' },
      }),
    ]);

    const estimatedMonthlyIncome = projectTotalMonthlyIncome(
      incomeStreams.map((s) => ({
        id: s.id, name: s.name, amount: Number(s.amount), currency: s.currency,
        frequency: s.frequency, dayOfMonth: s.dayOfMonth, isActive: s.isActive,
      })),
      currency,
    );

    let paidThisMonth = 0;
    let pendingThisMonth = 0;

    const mapped = bills.map((bill) => {
      const isConfirmed = bill.status === 'CONFIRMED';
      const billIdentity = bill.identityKey.toLowerCase();
      const billName = bill.displayName.trim().toLowerCase();

      const explicitTx = bill.occurrences?.[0]?.transaction;
      const match = explicitTx || monthTransactions.find((tx) => {
        const txKey = (tx.merchantKey || '').toLowerCase();
        const txName = tx.merchant.trim().toLowerCase();
        return (txKey && txKey === billIdentity) || txName === billName || txName.includes(billIdentity) || billIdentity.includes(txName);
      });

      let monthStatus: RecurringMonthStatus = 'UPCOMING';
      let lastPaidAmount: number | null = null;
      let lastPaidDate: string | null = null;
      const daysRemaining = daysFrom(today, bill.nextExpectedDate);

      if (match) {
        monthStatus = 'PAID';
        lastPaidAmount = Number(match.amount);
        lastPaidDate = toDateOnly(match.transactionDate);
        if (isConfirmed) paidThisMonth += Number(bill.expectedAmount);
      } else {
        monthStatus = daysRemaining < 0 ? 'OVERDUE' : 'UPCOMING';
        if (isConfirmed) pendingThisMonth += Number(bill.expectedAmount);
      }

      const linkedTransactionId = explicitTx ? explicitTx.id : (match ? match.id : null);
      const linkedTransactionName = explicitTx ? explicitTx.merchant : (match ? match.merchant : null);

      return recurringDto(bill, today, {
        monthStatus, lastPaidAmount, lastPaidDate, linkedTransactionId, linkedTransactionName,
      });
    });

    const confirmed = mapped.filter((bill) => bill.status === 'CONFIRMED');
    const fixedMonthlyBurden = round(confirmed.reduce((sum, bill) => sum + monthlyBurden(bill.expectedAmount, bill.cadence), 0));
    const freeDiscretionaryCash = Math.max(0, round(estimatedMonthlyIncome - fixedMonthlyBurden));
    const dueWithin = (days: number) => confirmed.filter((bill) => bill.daysRemaining >= 0 && bill.daysRemaining <= days).length;

    return {
      currency, generatedAt: new Date().toISOString(), analysisStatus: job?.status || 'PENDING',
      fixedMonthlyBurden, paidThisMonth: round(paidThisMonth), pendingThisMonth: round(pendingThisMonth),
      estimatedMonthlyIncome, freeDiscretionaryCash,
      upcoming: confirmed.filter((bill) => bill.daysRemaining >= 0 && bill.daysRemaining <= window),
      allConfirmed: confirmed,
      upcomingWindows: { in7: dueWithin(7), in14: dueWithin(14), in30: dueWithin(30) },
      suggestions: mapped.filter((bill) => bill.status === 'SUGGESTED'),
      attention: mapped.filter((bill) => bill.alerts.length > 0),
      paused: mapped.filter((bill) => bill.status === 'PAUSED'),
    };
  }

  async update(workspaceId: string, id: string, input: UpdateRecurringBillInput) {
    const existing = await prisma.recurringBill.findFirst({ where: { id, workspaceId } });
    if (!existing) return null;
    const updated = await prisma.recurringBill.update({
      where: { id },
      data: {
        ...input, ...(input.nextExpectedDate ? { nextExpectedDate: parseDateOnly(input.nextExpectedDate) } : {}),
        userEditedAt: new Date(),
        ...(input.status === 'DISMISSED' ? { dismissedAmount: input.expectedAmount ?? existing.expectedAmount } : {}),
      },
      include: { alerts: { where: { acknowledgedAt: null }, orderBy: { createdAt: 'desc' } } },
    });
    return recurringDto(updated);
  }

  async acknowledgeAlert(workspaceId: string, id: string) {
    const result = await prisma.recurringAlert.updateMany({
      where: { id, recurringBill: { workspaceId } }, data: { acknowledgedAt: new Date() },
    });
    return result.count > 0;
  }

  async sumFutureThroughMonthEnd(workspaceId: string, currency: string, today: string) {
    const [year, month] = today.slice(0, 7).split('-').map(Number);
    return this.sumFutureThrough(workspaceId, currency, today, toDateOnly(new Date(Date.UTC(year, month, 0))));
  }

  async sumFutureThrough(workspaceId: string, currency: string, after: string, through: string) {
    const start = parseDateOnly(after);
    const end = parseDateOnly(through);
    const bills = await prisma.recurringBill.findMany({ where: { workspaceId, currency, status: 'CONFIRMED' } });
    const totals = await Promise.all(bills.map(async (bill) => {
      const dates = projectedDates(bill.nextExpectedDate, bill.cadence, start, end);
      if (!dates.some((date) => toDateOnly(date) === after)) return dates.length * Number(bill.expectedAmount);
      const materialized = await prisma.transaction.findFirst({
        where: {
          workspaceId, currency, statusCode: 'APPROVED', ...expenseTransactionWhere(),
          transactionDate: { gte: new Date(`${after}T00:00:00.000-04:00`), lte: new Date(`${after}T23:59:59.999-04:00`) },
          OR: [{ merchantKey: bill.identityKey }, { merchant: { equals: bill.displayName, mode: 'insensitive' } }],
        },
        select: { id: true },
      });
      return (dates.length - (materialized ? 1 : 0)) * Number(bill.expectedAmount);
    }));
    return round(totals.reduce((sum, value) => sum + value, 0));
  }

  async linkTransaction(workspaceId: string, recurringBillId: string, transactionId: string) {
    const bill = await prisma.recurringBill.findFirst({ where: { id: recurringBillId, workspaceId } });
    if (!bill) throw new AppError(404, 'RECURRING_BILL_NOT_FOUND', 'No encontramos ese cobro recurrente.');
    const tx = await prisma.transaction.findFirst({ where: { id: transactionId, workspaceId } });
    if (!tx || tx.statusCode !== 'APPROVED' || tx.currency !== bill.currency) {
      throw new AppError(400, 'INVALID_RECURRING_TRANSACTION', 'El movimiento no es válido para este cobro recurrente.');
    }
    const data = { recurringBillId, amount: tx.amount, occurredAt: tx.transactionDate };
    await prisma.recurringOccurrence.upsert({ where: { transactionId }, update: data, create: { ...data, transactionId } });
    return { recurringBillId, transactionId };
  }

  async unlinkTransaction(workspaceId: string, recurringBillId: string, transactionId?: string) {
    const bill = await prisma.recurringBill.findFirst({ where: { id: recurringBillId, workspaceId } });
    if (!bill) throw new AppError(404, 'RECURRING_BILL_NOT_FOUND', 'No encontramos ese cobro recurrente.');
    await prisma.recurringOccurrence.deleteMany({ where: { recurringBillId, ...(transactionId ? { transactionId } : {}) } });
    return true;
  }

  async delete(workspaceId: string, id: string): Promise<boolean> {
    const bill = await prisma.recurringBill.findFirst({ where: { id, workspaceId } });
    if (!bill) throw new AppError(404, 'RECURRING_BILL_NOT_FOUND', 'No encontramos ese cobro recurrente.');
    await prisma.recurringBill.delete({ where: { id } });
    return true;
  }
}
