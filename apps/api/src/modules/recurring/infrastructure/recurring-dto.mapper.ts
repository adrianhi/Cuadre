import type { RecurringAlert, RecurringBill } from '@prisma/client';
import type { RecurringBillDto, RecurringMonthStatus } from '@bills/contracts';
import { daysFrom, toDateOnly } from '../domain/recurring-projection';

export type BillWithAlerts = RecurringBill & {
  alerts: RecurringAlert[];
  occurrences?: Array<{ transaction?: { id: string; merchant: string; amount: unknown; transactionDate: Date } | null }>;
};

export const round = (value: number) => Math.round(value * 100) / 100;

export function santoDomingoToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function recurringDto(
  bill: BillWithAlerts,
  today = santoDomingoToday(),
  extra?: {
    monthStatus?: RecurringMonthStatus;
    lastPaidAmount?: number | null;
    lastPaidDate?: string | null;
    linkedTransactionId?: string | null;
    linkedTransactionName?: string | null;
  },
): RecurringBillDto {
  return {
    id: bill.id, displayName: bill.displayName, currency: bill.currency as 'DOP' | 'USD',
    cadence: bill.cadence, expectedAmount: Number(bill.expectedAmount),
    nextExpectedDate: toDateOnly(bill.nextExpectedDate), lastSeenAt: bill.lastSeenAt.toISOString(),
    occurrenceCount: bill.occurrenceCount, confidence: bill.confidence,
    status: bill.status, userEdited: Boolean(bill.userEditedAt),
    daysRemaining: daysFrom(today, bill.nextExpectedDate),
    monthStatus: extra?.monthStatus ?? 'UPCOMING',
    lastPaidAmount: extra?.lastPaidAmount ?? null,
    lastPaidDate: extra?.lastPaidDate ?? null,
    linkedTransactionId: extra?.linkedTransactionId ?? null,
    linkedTransactionName: extra?.linkedTransactionName ?? null,
    alerts: bill.alerts.map((alert) => ({
      id: alert.id, kind: alert.kind,
      baselineAmount: alert.baselineAmount === null ? null : Number(alert.baselineAmount),
      observedAmount: alert.observedAmount === null ? null : Number(alert.observedAmount),
      createdAt: alert.createdAt.toISOString(),
    })),
  };
}
