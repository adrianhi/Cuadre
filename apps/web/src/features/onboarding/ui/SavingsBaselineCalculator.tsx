import { PiggyBank, Sparkles, Wallet } from 'lucide-react';
import type { IncomeFrequency } from '@bills/contracts';
import { formatCurrency } from '@/shared/lib';
import { CurrencyAmountInput, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import type { PaydayPreset } from '../model/useFinancialBaseline';

interface SavingsBaselineCalculatorProps {
  incomeAmount: string;
  frequency: IncomeFrequency;
  paydayPreset: PaydayPreset;
  customDay1: number;
  customDay2: number;
  savingsAmount: string;
  calculatedMonthlyIncome: number;
  calculatedMonthlySavings: number;
  effectiveSpendingLimit: number;
  onIncomeChange: (val: string) => void;
  onFrequencyChange: (val: IncomeFrequency) => void;
  onPaydayPresetChange: (val: PaydayPreset) => void;
  onCustomDay1Change: (val: number) => void;
  onCustomDay2Change: (val: number) => void;
  onSavingsChange: (val: string) => void;
  onSavingsPercentageSelect: (pct: number) => void;
}

const PRESETS: Array<{ id: PaydayPreset; label: string; desc: string }> = [
  { id: '15_30', label: '15 y 30', desc: 'Tradicional' },
  { id: '14_29', label: '14 y 29', desc: 'Fin de mes adelantado' },
  { id: '10_25', label: '10 y 25', desc: 'Zonas francas / turismo' },
  { id: 'custom', label: 'A mi medida', desc: 'Otros días' },
];

export function SavingsBaselineCalculator(props: SavingsBaselineCalculatorProps) {
  const {
    incomeAmount, frequency, paydayPreset, customDay1, customDay2,
    savingsAmount, calculatedMonthlyIncome, calculatedMonthlySavings, effectiveSpendingLimit,
    onIncomeChange, onFrequencyChange, onPaydayPresetChange,
    onCustomDay1Change, onCustomDay2Change, onSavingsChange, onSavingsPercentageSelect,
  } = props;

  return (
    <div className="space-y-4">
      {/* 1. Regular Income & Schedule */}
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">1. ¿Cuánto ganas y cuándo cobras?</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Monto por cobro (DOP)
            <CurrencyAmountInput
              placeholder="Ej. 25,000"
              value={incomeAmount}
              onValueChange={onIncomeChange}
              className="font-mono text-base font-semibold"
            />
          </label>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground">Frecuencia de cobro</label>
            <Select value={frequency} onValueChange={(val) => onFrequencyChange(val as IncomeFrequency)}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BIWEEKLY_15_30">Quincenal (2 pagos al mes)</SelectItem>
                <SelectItem value="MONTHLY">Mensual (1 cobro al mes)</SelectItem>
                <SelectItem value="WEEKLY">Semanal (cada 7 días)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {frequency === 'BIWEEKLY_15_30' && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-muted-foreground">Tus días de quincena habituales</label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPaydayPresetChange(p.id)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    paydayPreset === p.id
                      ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                      : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <p className="text-xs">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{p.desc}</p>
                </button>
              ))}
            </div>

            {paydayPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="grid gap-1 text-xs text-muted-foreground">
                  Primer día del mes
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={customDay1}
                    onChange={(e) => onCustomDay1Change(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
                    className="h-8 text-xs font-semibold"
                  />
                </label>
                <label className="grid gap-1 text-xs text-muted-foreground">
                  Segundo día del mes
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={customDay2}
                    onChange={(e) => onCustomDay2Change(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
                    className="h-8 text-xs font-semibold"
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Pay Yourself First (Savings Target) */}
      <div className="space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-foreground">2. Págate a ti primero (Meta de Ahorro)</h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" /> Blindado
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Aparta tu ahorro antes de presupuestar tus gastos. Cuadre lo protegerá automáticamente para que tu margen diario no lo devore.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Ahorro por cada pago (DOP)
            <CurrencyAmountInput
              placeholder="Ej. 5,000"
              value={savingsAmount}
              onValueChange={onSavingsChange}
              className="font-mono text-base font-semibold"
            />
          </label>
          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Sugerencias rápidas</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {[10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onSavingsPercentageSelect(pct)}
                  className="flex-1 rounded-lg border border-border/80 bg-background py-2 text-xs font-bold text-foreground transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Equation Breakdown */}
        {calculatedMonthlyIncome > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 text-xs space-y-1.5 shadow-2xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Ingreso mensual estimado:</span>
              <strong className="text-foreground">{formatCurrency(calculatedMonthlyIncome, 'DOP')}</strong>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Ahorro mensual protegido:</span>
              <strong>- {formatCurrency(calculatedMonthlySavings, 'DOP')}</strong>
            </div>
            <div className="border-t border-border/60 pt-1.5 flex justify-between font-bold text-foreground text-sm">
              <span>Tu presupuesto para vivir:</span>
              <span className="text-primary">{formatCurrency(effectiveSpendingLimit, 'DOP')} / mes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
