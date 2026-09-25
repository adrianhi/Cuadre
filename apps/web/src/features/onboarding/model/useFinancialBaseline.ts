import { useMemo, useState } from 'react';
import type { IncomeFrequency } from '@bills/contracts';
import { formatAmountInputOnBlur, parseAmountInput } from '@/shared/lib';
import { COMMON_RD_SERVICES } from './common-recurring-services';
import {
  calculateMonthlyIncome,
  calculateMonthlySavings,
  calculateSavingsFromPercentage,
  calculateSpendingLimit,
  resolvePaydayDays,
  type PaydayPreset,
} from './baseline-calculator';

export type { PaydayPreset };

export function useFinancialBaseline() {
  const [mode, setMode] = useState<'guided' | 'manual'>('guided');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('BIWEEKLY_15_30');
  const [paydayPreset, setPaydayPreset] = useState<PaydayPreset>('15_30');
  const [customDay1, setCustomDay1] = useState(15);
  const [customDay2, setCustomDay2] = useState(30);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [manualSpendingLimit, setManualSpendingLimit] = useState('');

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceAmounts, setServiceAmounts] = useState<Record<string, string>>(
    Object.fromEntries(
      COMMON_RD_SERVICES.map((s) => [s.id, formatAmountInputOnBlur(s.defaultAmount)]),
    ),
  );

  const parsedIncome = Number(parseAmountInput(incomeAmount)) || 0;
  const parsedSavings = Number(parseAmountInput(savingsAmount)) || 0;
  const parsedManualLimit = Number(parseAmountInput(manualSpendingLimit)) || 0;

  const calculatedMonthlyIncome = calculateMonthlyIncome(parsedIncome, frequency);
  const calculatedMonthlySavings = calculateMonthlySavings(parsedSavings, frequency);
  const calculatedSpendingLimit = calculateSpendingLimit(calculatedMonthlyIncome, calculatedMonthlySavings);

  const effectiveSpendingLimit = mode === 'guided'
    ? (calculatedSpendingLimit > 0 ? calculatedSpendingLimit : parsedManualLimit)
    : parsedManualLimit;

  const estimatedFixedExpenses = useMemo(() => {
    return COMMON_RD_SERVICES
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + (Number(parseAmountInput(serviceAmounts[s.id])) || 0), 0);
  }, [selectedServices, serviceAmounts]);

  const daysRemaining = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return Math.max(1, new Date(Date.UTC(year, month, 0)).getUTCDate() - day + 1);
  }, []);

  const variableMonthlyMargin = Math.max(0, effectiveSpendingLimit - estimatedFixedExpenses);
  const estimatedDailyMargin = daysRemaining > 0 ? variableMonthlyMargin / daysRemaining : 0;

  const validLimit = effectiveSpendingLimit > 0 && effectiveSpendingLimit <= 999_999_999.99;
  const validServices = selectedServices.every((id) => {
    const amount = Number(parseAmountInput(serviceAmounts[id]));
    return amount > 0 && amount <= 999_999_999.99;
  });

  const { resolvedDay1, resolvedDay2 } = useMemo(() => {
    const resolved = resolvePaydayDays(frequency, paydayPreset, customDay1, customDay2);
    return { resolvedDay1: resolved.dayOfMonth, resolvedDay2: resolved.secondDayOfMonth };
  }, [frequency, paydayPreset, customDay1, customDay2]);

  const selectSavingsPercentage = (pct: number) => {
    if (parsedIncome <= 0) return;
    const target = calculateSavingsFromPercentage(parsedIncome, pct);
    setSavingsAmount(formatAmountInputOnBlur(target));
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return {
    mode, setMode,
    incomeAmount, setIncomeAmount,
    frequency, setFrequency,
    paydayPreset, setPaydayPreset,
    customDay1, setCustomDay1,
    customDay2, setCustomDay2,
    resolvedDay1, resolvedDay2,
    savingsAmount, setSavingsAmount,
    selectSavingsPercentage,
    manualSpendingLimit, setManualSpendingLimit,
    selectedServices, toggleService,
    serviceAmounts, setServiceAmounts,
    parsedIncome, parsedSavings,
    calculatedMonthlyIncome, calculatedMonthlySavings,
    effectiveSpendingLimit, estimatedFixedExpenses,
    estimatedDailyMargin, daysRemaining,
    validLimit, validServices,
  };
}
