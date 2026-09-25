import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { CreateIncomeStreamInput, IncomeFrequency } from '@bills/contracts';
import { formatAmountInputOnBlur, parseAmountInput } from '@/shared/lib';
import { Button, CurrencyAmountInput, Input } from '@/shared/ui';

interface IncomeStreamFormProps {
  currency: string;
  isPending: boolean;
  onSubmit: (input: CreateIncomeStreamInput) => void;
}

type PaydayPreset = '15_30' | '14_29' | '10_25' | 'custom';

const FREQUENCIES: Array<{ id: IncomeFrequency; label: string }> = [
  { id: 'BIWEEKLY_15_30', label: 'Quincenal' },
  { id: 'MONTHLY', label: 'Mensual' },
  { id: 'WEEKLY', label: 'Semanal' },
];

const PRESETS: Array<{ id: PaydayPreset; label: string }> = [
  { id: '15_30', label: '15 y 30' },
  { id: '14_29', label: '14 y 29' },
  { id: '10_25', label: '10 y 25' },
  { id: 'custom', label: 'A mi medida' },
];

export function IncomeStreamForm({ currency, isPending, onSubmit }: IncomeStreamFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('BIWEEKLY_15_30');
  const [paydayPreset, setPaydayPreset] = useState<PaydayPreset>('15_30');
  const [customDay1, setCustomDay1] = useState(15);
  const [customDay2, setCustomDay2] = useState(30);
  const [savingsTarget, setSavingsTarget] = useState('');
  const [error, setError] = useState('');

  const handlePercentageSelect = (pct: number) => {
    const raw = Number(parseAmountInput(amount)) || 0;
    if (raw <= 0) return;
    const calculated = Math.round((raw * pct) / 100);
    setSavingsTarget(formatAmountInputOnBlur(calculated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Number(parseAmountInput(amount));
    if (!name.trim()) {
      setError('Ingresa un nombre para la fuente');
      return;
    }
    if (!rawAmount || rawAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    let dayOfMonth: number | null = null;
    let secondDayOfMonth: number | null = null;

    if (frequency === 'BIWEEKLY_15_30') {
      if (paydayPreset === '15_30') {
        dayOfMonth = 15;
        secondDayOfMonth = 30;
      } else if (paydayPreset === '14_29') {
        dayOfMonth = 14;
        secondDayOfMonth = 29;
      } else if (paydayPreset === '10_25') {
        dayOfMonth = 10;
        secondDayOfMonth = 25;
      } else {
        dayOfMonth = customDay1;
        secondDayOfMonth = customDay2;
      }
    } else if (frequency === 'MONTHLY') {
      dayOfMonth = 1;
    }

    const rawSavings = Number(parseAmountInput(savingsTarget));

    onSubmit({
      name: name.trim(),
      amount: rawAmount,
      currency,
      frequency,
      dayOfMonth,
      secondDayOfMonth,
      savingsTarget: rawSavings > 0 ? rawSavings : null,
    });

    setName('');
    setAmount('');
    setSavingsTarget('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Añadir fuente de ingreso</p>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-emerald-500" /> Personalizado
        </span>
      </div>

      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}

      <div className="space-y-2">
        <Input
          placeholder="Nombre (ej. Nómina Empresa, Freelance)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 text-xs"
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-[11px] text-muted-foreground">
            Monto por pago (DOP)
            <CurrencyAmountInput
              placeholder="Ej. 25,000"
              value={amount}
              onValueChange={setAmount}
              className="h-9 text-xs font-semibold"
            />
          </label>
          <div className="grid gap-1 text-[11px] text-muted-foreground">
            <span>Frecuencia</span>
            <div className="grid grid-cols-3 gap-1">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={`rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-all ${
                    frequency === f.id
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {frequency === 'BIWEEKLY_15_30' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground">Días de corte / cobro</span>
            <div className="grid grid-cols-4 gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaydayPreset(p.id)}
                  className={`rounded-lg border py-1 text-center text-[10px] font-semibold transition-all ${
                    paydayPreset === p.id
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-border/60 bg-background text-muted-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {paydayPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Día 1 (ej. 14)"
                  value={customDay1}
                  onChange={(e) => setCustomDay1(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
                  className="h-8 text-xs font-semibold"
                />
                <Input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Día 2 (ej. 29)"
                  value={customDay2}
                  onChange={(e) => setCustomDay2(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
                  className="h-8 text-xs font-semibold"
                />
              </div>
            )}
          </div>
        )}

        {/* Savings Target for this stream */}
        <div className="space-y-1.5 border-t border-border/60 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">Ahorro a blindar de este cobro</span>
            <div className="flex gap-1">
              {[10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageSelect(pct)}
                  className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <CurrencyAmountInput
            placeholder="Opcional. Ej. 5,000"
            value={savingsTarget}
            onValueChange={setSavingsTarget}
            className="h-9 text-xs font-semibold"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="sm" className="w-full h-8 gap-1.5 text-xs font-bold">
        <Plus className="h-3.5 w-3.5" />
        <span>{isPending ? 'Guardando…' : 'Añadir fuente'}</span>
      </Button>
    </form>
  );
}
