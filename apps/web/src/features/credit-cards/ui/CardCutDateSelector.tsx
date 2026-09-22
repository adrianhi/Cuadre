import { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui';
import {
  DOMINICAN_DUE_CHIPS,
  deduceClosingDayFromDueDay,
  getBankCommonCuts,
} from '../model/closing-date-solver';

export interface CardCutDateSelectorProps {
  institutionCode: string;
  closingDay: number;
  graceDays: number;
  onClosingDayChange: (closingDay: number) => void;
  onGraceDaysChange: (graceDays: number) => void;
  closingDayError?: string;
  graceDaysError?: string;
}

const MODES = [
  { key: 'due_day', label: 'Sé mi fecha límite de pago', icon: Sparkles },
  { key: 'closing_day', label: 'Sé mi día de corte', icon: Calendar },
] as const;

export function CardCutDateSelector({
  institutionCode,
  closingDay,
  graceDays,
  onClosingDayChange,
  onGraceDaysChange,
  closingDayError,
  graceDaysError,
}: CardCutDateSelectorProps) {
  const [mode, setMode] = useState<'due_day' | 'closing_day'>('due_day');

  const [dueDay, setDueDay] = useState<number>(() => {
    const raw = closingDay + (graceDays || 22);
    return raw > 30 ? raw - 30 : raw;
  });

  const commonCuts = getBankCommonCuts(institutionCode);
  const deduction = deduceClosingDayFromDueDay(dueDay, institutionCode, graceDays);
  const effectiveDeducedCut = deduction.matchedOfficialCut ?? deduction.calculatedClosingDay;

  const handleDueDayChange = (newDueDay: number) => {
    const safe = Math.min(31, Math.max(1, Math.round(newDueDay)));
    setDueDay(safe);
    const result = deduceClosingDayFromDueDay(safe, institutionCode, graceDays);
    onClosingDayChange(result.matchedOfficialCut ?? result.calculatedClosingDay);
  };

  const handleGraceDaysChange = (newGrace: number) => {
    onGraceDaysChange(newGrace);
    if (mode === 'due_day') {
      const res = deduceClosingDayFromDueDay(dueDay, institutionCode, newGrace);
      onClosingDayChange(res.matchedOfficialCut ?? res.calculatedClosingDay);
    }
  };

  return (
    <div className="col-span-1 sm:col-span-2 space-y-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4">
      {/* Mode Switch Tabs */}
      <div className="flex p-1 bg-muted rounded-xl gap-1">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              if (key === 'due_day') onClosingDayChange(effectiveDeducedCut);
            }}
            className={cn(
              'flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5',
              mode === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', key === 'due_day' && 'text-primary')} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'due_day' ? (
        <div className="space-y-2.5">
          <p className="text-[11px] text-muted-foreground leading-snug">
            ¿No recuerdas el corte? Dinos qué día pagas y Cuadre calcula tu corte automáticamente.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {DOMINICAN_DUE_CHIPS.map((chip) => (
              <button
                key={chip.day}
                type="button"
                onClick={() => handleDueDayChange(chip.day)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-lg border transition',
                  dueDay === chip.day
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-foreground border-border hover:bg-muted/70'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Corte deducido: Día {closingDay || effectiveDeducedCut}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">{deduction.explanation}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {commonCuts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Cortes oficiales comunes:</span>
              <div className="flex flex-wrap gap-1.5">
                {commonCuts.map((cut) => (
                  <button
                    key={cut}
                    type="button"
                    onClick={() => onClosingDayChange(cut)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-lg border transition',
                      closingDay === cut
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-foreground border-border hover:bg-muted/70'
                    )}
                  >
                    Día {cut}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            {mode === 'due_day' ? 'Otro día de pago (1 - 31)' : 'Día de corte (1 - 31)'}
          </label>
          <Input
            type="number"
            min={1}
            max={31}
            value={mode === 'due_day' ? dueDay : closingDay}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (mode === 'due_day') handleDueDayChange(val);
              else onClosingDayChange(val);
            }}
            className="h-9 rounded-xl"
          />
          {mode === 'closing_day' && closingDayError && (
            <p className="text-[11px] text-destructive">{closingDayError}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Días de gracia{' '}
            <span className="text-[10px] text-muted-foreground font-normal">(banco: {deduction.graceDaysUsed})</span>
          </label>
          <Input
            type="number"
            min={0}
            max={60}
            value={graceDays}
            onChange={(e) => handleGraceDaysChange(Number(e.target.value))}
            className="h-9 rounded-xl"
          />
          {graceDaysError && <p className="text-[11px] text-destructive">{graceDaysError}</p>}
        </div>
      </div>
    </div>
  );
}
