import { useState } from 'react';

import { AlertCircle, ArrowRight, Calculator, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { IncomeFrequency } from '@bills/contracts';
import { formatCurrency, parseAmountInput } from '@/shared/lib';
import { Button, Card, CardContent, CurrencyAmountInput, Tabs, TabsList, TabsTrigger } from '@/shared/ui';
import { COMMON_RD_SERVICES } from '../model/common-recurring-services';
import { useFinancialBaseline } from '../model/useFinancialBaseline';
import { SavingsBaselineCalculator } from './SavingsBaselineCalculator';
import { RecurringServiceSelector } from './RecurringServiceSelector';
import { MonthComparisonModal } from './MonthComparisonModal';

interface FinancialBaselineStepProps {
  busy: boolean;
  error?: string;
  onFinish: (
    monthlySpendingLimit: number,
    income?: {
      amount: number;
      frequency: IncomeFrequency;
      dayOfMonth?: number | null;
      secondDayOfMonth?: number | null;
      savingsTarget?: number | null;
    },
    recurringServices?: Array<{ name: string; amount: number }>,
  ) => void;
  onSkip: () => void;
}

export function FinancialBaselineStep({
  busy,
  error,
  onFinish,
  onSkip,
}: FinancialBaselineStepProps) {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const baseline = useFinancialBaseline();
  const {
    mode, setMode, incomeAmount, setIncomeAmount, frequency, setFrequency,
    paydayPreset, setPaydayPreset, customDay1, setCustomDay1, customDay2, setCustomDay2,
    resolvedDay1, resolvedDay2, savingsAmount, setSavingsAmount, selectSavingsPercentage,
    manualSpendingLimit, setManualSpendingLimit, selectedServices, toggleService,
    serviceAmounts, setServiceAmounts, parsedIncome, parsedSavings, calculatedMonthlyIncome,
    calculatedMonthlySavings, effectiveSpendingLimit, estimatedFixedExpenses,
    estimatedDailyMargin, validLimit, validServices,
  } = baseline;


  const handleComplete = () => {
    if (!validLimit || !validServices) return;

    const incomeData = parsedIncome > 0 ? {
      amount: parsedIncome,
      frequency,
      dayOfMonth: resolvedDay1,
      secondDayOfMonth: resolvedDay2,
      savingsTarget: parsedSavings > 0 ? parsedSavings : null,
    } : undefined;

    const recurringData = COMMON_RD_SERVICES
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => ({
        name: s.name,
        amount: Number(parseAmountInput(serviceAmounts[s.id])) || 0,
      }));

    onFinish(effectiveSpendingLimit, incomeData, recurringData);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-xl">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
          Paso 2 de 2 · Tu Punto de Partida
        </p>
        <h1 className="mt-1 text-2xl font-bold">Diseña tu Presupuesto Seguro</h1>
        <p className="mt-2 max-w-lg text-sm text-emerald-50/90">
          Aparta tu ahorro primero, separa tus compromisos fijos y descubre cuánto puedes gastar cada día sin remordimientos.
        </p>
      </div>

      <CardContent className="space-y-6 p-6">
        {/* Full-width mode switcher tabs - No line wrap */}
        <div className="space-y-2.5">
          <Tabs
            value={mode}
            onValueChange={(val) => setMode(val as 'guided' | 'manual')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1 border border-border/60">
              <TabsTrigger
                value="guided"
                className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <Calculator className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate">Guiado (Págate primero)</span>
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Límite manual</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            type="button"
            onClick={() => setIsComparisonOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 transition hover:bg-emerald-500/10"
          >
            <span className="flex items-center gap-1.5 font-bold text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ¿Dudas? Compara tu mes con vs sin Cuadre
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">Ver comparativa &rarr;</span>
          </button>
        </div>

        {mode === 'guided' ? (
          <SavingsBaselineCalculator
            incomeAmount={incomeAmount}
            frequency={frequency}
            paydayPreset={paydayPreset}
            customDay1={customDay1}
            customDay2={customDay2}
            savingsAmount={savingsAmount}
            calculatedMonthlyIncome={calculatedMonthlyIncome}
            calculatedMonthlySavings={calculatedMonthlySavings}
            effectiveSpendingLimit={effectiveSpendingLimit}
            onIncomeChange={setIncomeAmount}
            onFrequencyChange={setFrequency}
            onPaydayPresetChange={setPaydayPreset}
            onCustomDay1Change={setCustomDay1}
            onCustomDay2Change={setCustomDay2}
            onSavingsChange={setSavingsAmount}
            onSavingsPercentageSelect={selectSavingsPercentage}
          />
        ) : (
          <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
            <h3 className="text-sm font-bold text-foreground">¿Cuál es tu límite mensual de gasto?</h3>
            <p className="text-xs text-muted-foreground">
              Monto total que planeas gastar en el mes incluyendo gastos fijos y variables.
            </p>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Límite mensual (DOP)
              <CurrencyAmountInput
                placeholder="Ej. 45,000"
                value={manualSpendingLimit}
                onValueChange={setManualSpendingLimit}
                aria-invalid={manualSpendingLimit.length > 0 && !validLimit}
                className="font-mono text-base font-semibold"
              />
            </label>
          </div>
        )}

        {/* 3. Recurring Fixed Services */}
        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-bold text-foreground">3. Compromisos fijos habituales (opcional)</h3>
          <p className="text-xs text-muted-foreground">
            Servicios que se cobran cada mes y no deben contarse como dinero libre para el día a día.
          </p>
          <RecurringServiceSelector
            selectedServices={selectedServices}
            serviceAmounts={serviceAmounts}
            valid={validServices}
            onToggle={toggleService}
            onAmountChange={(id, amount) => setServiceAmounts((c) => ({ ...c, [id]: amount }))}
          />
        </div>

        {/* Live Calculation Preview Card */}
        {validLimit && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-center sm:text-left">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Margen Seguro Diario resultante:
            </p>
            <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
              <p className="text-xs text-muted-foreground">
                Presupuesto mensual: <strong className="text-foreground">{formatCurrency(effectiveSpendingLimit, 'DOP')}</strong>
                {estimatedFixedExpenses > 0 ? (
                  <> - Fijos: <strong className="text-foreground">{formatCurrency(estimatedFixedExpenses, 'DOP')}</strong></>
                ) : null}
              </p>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-400 sm:text-lg">
                ≈ {formatCurrency(estimatedDailyMargin, 'DOP')} / día
              </p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Se ajustará en tiempo real con tus movimientos bancarios y los días restantes del mes.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {error && (
            <div className="flex gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            className="min-h-12 w-full gap-2 text-base font-bold shadow-md shadow-emerald-500/20"
            disabled={busy || !validLimit || !validServices}
            onClick={handleComplete}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparando tu panel…</span>
              </>
            ) : (
              <>
                <span>Guardar y ver mi Margen Seguro</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            disabled={busy}
            onClick={onSkip}
          >
            Entrar sin calcular mi margen todavía
          </button>
        </div>
      </CardContent>

      <MonthComparisonModal
        open={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
        initialIncome={parsedIncome > 0 ? parsedIncome : 50000}
      />
    </Card>
  );
}
