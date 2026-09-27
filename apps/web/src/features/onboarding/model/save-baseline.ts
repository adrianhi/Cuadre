import type { IncomeFrequency } from '@bills/contracts';
import { budgetService, currentBudgetMonth } from '@/entities/budget';
import { incomeService } from '@/entities/income';
import { recurringService } from '@/entities/recurring-bill';

function santoDomingoToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export interface BaselineSaveParams {
  monthlySpendingLimit: number;
  income?: {
    amount: number;
    frequency: IncomeFrequency;
    dayOfMonth?: number | null;
    secondDayOfMonth?: number | null;
    savingsTarget?: number | null;
  };
  recurringServices?: Array<{ name: string; amount: number }>;
}

export async function saveFinancialBaseline({
  monthlySpendingLimit,
  income,
  recurringServices,
}: BaselineSaveParams) {
  await budgetService.replace({
    month: currentBudgetMonth(),
    currency: 'DOP',
    propagation: 'CURRENT_AND_FUTURE',
    globalLimit: monthlySpendingLimit,
    categories: [],
  });

  if (income && income.amount > 0) {
    const streams = await incomeService.listStreams();
    const existing = streams.find(
      (stream) =>
        stream.currency === 'DOP' &&
        stream.name.trim().toLocaleLowerCase('es') === 'nómina principal',
    );
    if (existing) {
      await incomeService.updateStream(existing.id, {
        amount: income.amount,
        frequency: income.frequency,
        currency: 'DOP',
        dayOfMonth: income.dayOfMonth,
        secondDayOfMonth: income.secondDayOfMonth,
        savingsTarget: income.savingsTarget,
        isActive: true,
      });
    } else {
      await incomeService.createStream({
        name: 'Nómina Principal',
        amount: income.amount,
        frequency: income.frequency,
        currency: 'DOP',
        dayOfMonth: income.dayOfMonth,
        secondDayOfMonth: income.secondDayOfMonth,
        savingsTarget: income.savingsTarget,
      });
    }
  }

  if (recurringServices && recurringServices.length > 0) {
    const todayStr = santoDomingoToday();
    await Promise.all(
      recurringServices.map((service) =>
        recurringService.create({
          displayName: service.name,
          expectedAmount: service.amount,
          currency: 'DOP',
          cadence: 'MONTHLY',
          nextExpectedDate: todayStr,
        }),
      ),
    );
  }
}
