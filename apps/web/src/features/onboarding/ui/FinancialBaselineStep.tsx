import { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Sparkles, Wallet } from 'lucide-react';
import type { IncomeFrequency } from '@bills/contracts';
import { formatCurrency } from '@/shared/lib';
import { Button, Card, CardContent, Input } from '@/shared/ui';
import { COMMON_RD_SERVICES } from '../model/common-recurring-services';
import { RecurringServiceSelector } from './RecurringServiceSelector';

interface FinancialBaselineStepProps {
  busy: boolean;
  error?: string;
  onFinish: (
    monthlySpendingLimit: number,
    income?: { amount: number; frequency: IncomeFrequency },
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
  const [monthlySpendingLimit, setMonthlySpendingLimit] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('BIWEEKLY_15_30');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceAmounts, setServiceAmounts] = useState<Record<string, string>>(
    Object.fromEntries(COMMON_RD_SERVICES.map((service) => [service.id, String(service.defaultAmount)])),
  );

  const parsedLimit = Number(monthlySpendingLimit) || 0;
  const parsedIncome = Number(incomeAmount) || 0;
  const monthlyIncome = parsedIncome > 0
    ? frequency === 'BIWEEKLY_15_30'
      ? parsedIncome * 2
      : frequency === 'WEEKLY'
        ? parsedIncome * 52 / 12
        : parsedIncome
    : 0;

  const estimatedFixedExpenses = COMMON_RD_SERVICES
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (Number(serviceAmounts[s.id]) || 0), 0);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const daysRemaining = new Date(Date.UTC(year, month, 0)).getUTCDate() - day + 1;
  const variableMonthlyMargin = Math.max(0, parsedLimit - estimatedFixedExpenses);
  const estimatedDailyMargin = daysRemaining > 0 ? variableMonthlyMargin / daysRemaining : 0;
  const validLimit = parsedLimit > 0 && parsedLimit <= 999_999_999.99;
  const validServices = selectedServices.every((id) => {
    const amount = Number(serviceAmounts[id]);
    return amount > 0 && amount <= 999_999_999.99;
  });

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleComplete = () => {
    const incomeData = parsedIncome > 0 ? { amount: parsedIncome, frequency } : undefined;
    const recurringData = COMMON_RD_SERVICES
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => ({ name: s.name, amount: Number(serviceAmounts[s.id]) }));

    if (!validLimit || !validServices) return;
    onFinish(parsedLimit, incomeData, recurringData);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-xl">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
          Paso 2 de 2 · Margen Seguro
        </p>
        <h1 className="mt-1 text-2xl font-bold">Calcula tu Margen Seguro</h1>
        <p className="mt-2 max-w-lg text-sm text-emerald-50/90">
          Define cuánto quieres gastar y Cuadre lo convertirá en una guía diaria que se ajusta con tus movimientos.
        </p>
      </div>

      <CardContent className="space-y-6 p-6">
        <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">¿Cuál es tu límite mensual de gasto?</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Incluye gastos variables y compromisos fijos. Este límite activa tu Margen Seguro Diario.
          </p>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Límite mensual (DOP)
            <Input
              type="number"
              min="1"
              max="999999999.99"
              step="500"
              placeholder="Ej. 45,000"
              value={monthlySpendingLimit}
              onChange={(event) => setMonthlySpendingLimit(event.target.value)}
              aria-invalid={monthlySpendingLimit.length > 0 && !validLimit}
            />
          </label>
          {monthlySpendingLimit.length > 0 && !validLimit && (
            <p className="text-xs text-destructive">El límite debe ser mayor que cero.</p>
          )}
        </div>

        {/* Income Input */}
        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              ¿Cuánto estimas que ingresas (neto)? <span className="font-normal text-muted-foreground">Opcional</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Monto (DOP)
              <Input
                type="number"
                min="0"
                step="500"
                placeholder="Ej. 35,000"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Frecuencia de pago
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
              >
                <option value="BIWEEKLY_15_30">Quincenal (15 y 30)</option>
                <option value="MONTHLY">Mensual (1 cobro/mes)</option>
                <option value="WEEKLY">Semanal</option>
              </select>
            </label>
          </div>
        </div>

        <RecurringServiceSelector
          selectedServices={selectedServices}
          serviceAmounts={serviceAmounts}
          valid={validServices}
          onToggle={toggleService}
          onAmountChange={(id, amount) => setServiceAmounts((current) => ({
            ...current,
            [id]: amount,
          }))}
        />

        {/* Live Calculation Preview Card */}
        {validLimit && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-center sm:text-left">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Estimación inicial de tu Margen Seguro:
            </p>
            <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
              <p className="text-xs text-muted-foreground">
                Límite: <strong className="text-foreground">{formatCurrency(parsedLimit, 'DOP')}</strong> - Compromisos:{' '}
                <strong className="text-foreground">{formatCurrency(estimatedFixedExpenses, 'DOP')}</strong>
              </p>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-400 sm:text-lg">
                ≈ {formatCurrency(estimatedDailyMargin, 'DOP')} / día
              </p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Se ajustará con tus movimientos importados y los días que quedan del mes.
              {monthlyIncome > 0 ? ` Ingreso mensual estimado: ${formatCurrency(monthlyIncome, 'DOP')}.` : ''}
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
                <span>Preparando tu dashboard…</span>
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
            Omitir por ahora y configurar más tarde
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
