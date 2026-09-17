import { useState } from 'react';
import { Calculator, Calendar, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { calculateSimulatedMargin, SIMULATOR_PRESETS, type MarginSimulatorInput } from '../lib/margin-simulator';
import { formatAmountInput, formatAmountInputOnBlur, parseAmountInput } from '../lib/formatters';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SimulatorForm {
  monthlyLimit: string;
  commitments: string;
  spentBeforeToday: string;
  spentToday: string;
  daysRemaining: string;
}

interface AmountFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isBold?: boolean;
}

function AmountField({ label, value, onChange, isBold }: AmountFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 z-10">RD$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(formatAmountInput(e.target.value))}
          onBlur={() => {
            if (value) onChange(formatAmountInputOnBlur(value));
          }}
          aria-label={label}
          className={cn(
            'w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors',
            isBold && 'font-semibold'
          )}
        />
      </div>
    </div>
  );
}

export function InteractiveMarginCalculator() {
  const [form, setForm] = useState<SimulatorForm>({
    monthlyLimit: formatAmountInputOnBlur(50000),
    commitments: formatAmountInputOnBlur(18000),
    spentBeforeToday: formatAmountInputOnBlur(14000),
    spentToday: formatAmountInputOnBlur(850),
    daysRemaining: '12',
  });

  const [activePreset, setActivePreset] = useState<string>('preset-50k');

  const params: MarginSimulatorInput = {
    monthlyLimit: Number(parseAmountInput(form.monthlyLimit)) || 0,
    commitments: Number(parseAmountInput(form.commitments)) || 0,
    spentBeforeToday: Number(parseAmountInput(form.spentBeforeToday)) || 0,
    spentToday: Number(parseAmountInput(form.spentToday)) || 0,
    daysRemaining: Math.max(1, Number(form.daysRemaining) || 1),
  };

  const result = calculateSimulatedMargin(params);

  const applyPreset = (presetId: string) => {
    const preset = SIMULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(preset.id);
    setForm({
      monthlyLimit: formatAmountInputOnBlur(preset.monthlyLimit),
      commitments: formatAmountInputOnBlur(preset.commitments),
      spentBeforeToday: formatAmountInputOnBlur(preset.spentBeforeToday),
      spentToday: formatAmountInputOnBlur(preset.spentToday),
      daysRemaining: String(preset.daysRemaining),
    });
  };

  const updateAmount = (field: keyof Omit<SimulatorForm, 'daysRemaining'>, val: string) => {
    setActivePreset('');
    setForm((prev) => ({ ...prev, [field]: formatAmountInput(val) }));
  };

  const updateDays = (val: string) => {
    setActivePreset('');
    setForm((prev) => ({ ...prev, daysRemaining: val.replace(/\D/g, '').slice(0, 2) }));
  };

  const color = result.status === 'EXCEEDED' ? '#ef4444' : result.status === 'ADJUSTING' ? '#f59e0b' : '#10b981';
  const percentage = result.initialDailyAllowance > 0
    ? Math.min(100, Math.round((result.todayAvailable / result.initialDailyAllowance) * 100))
    : 0;

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 md:p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
      {/* Header with presets */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Simulador en vivo del Margen Seguro</h3>
            <p className="text-xs text-slate-400">Prueba cómo el motor de Cuadre recalcula tu gasto diario</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Ejemplos:</span>
          {SIMULATOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                activePreset === preset.id
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Inputs + Dial */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Inputs (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <AmountField
              label="Límite mensual previsto"
              value={form.monthlyLimit}
              onChange={(val) => updateAmount('monthlyLimit', val)}
              isBold
            />
            <AmountField
              label="Cobros fijos reservados"
              value={form.commitments}
              onChange={(val) => updateAmount('commitments', val)}
              isBold
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <AmountField
              label="Gastado antes de hoy"
              value={form.spentBeforeToday}
              onChange={(val) => updateAmount('spentBeforeToday', val)}
            />
            <AmountField
              label="Gastado hoy"
              value={form.spentToday}
              onChange={(val) => updateAmount('spentToday', val)}
            />

            <div>
              <label className="text-xs font-semibold text-slate-300">Días para cobrar</label>
              <div className="relative mt-1">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.daysRemaining}
                  onChange={(e) => updateDays(e.target.value)}
                  aria-label="Días restantes para cobrar"
                  className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Resta aplicada en vivo: </span>
            (RD$ {formatAmountInput(params.monthlyLimit)} − RD$ {formatAmountInput(params.spentBeforeToday)} acumulados − RD$ {formatAmountInput(params.commitments)} compromisos) ÷ {params.daysRemaining} días = <strong className="text-emerald-400">RD$ {formatAmountInput(result.initialDailyAllowance)}/día</strong>. Menos RD$ {formatAmountInput(params.spentToday)} gastados hoy.
          </div>
        </div>

        {/* Right Dial (5 cols) */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 text-center lg:col-span-5 shadow-inner">
          <div className="flex w-full items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Gauge className="h-4 w-4" /> Margen Seguro Hoy
            </span>
            <span>{params.daysRemaining} días restantes</span>
          </div>

          {/* Conic Dial Meter with Dynamic Ambient Glow */}
          <div
            className="mt-4 grid h-40 w-40 place-items-center rounded-full p-2.5 transition-all duration-500 hover:scale-105 cursor-default"
            style={{
              background: `conic-gradient(${color} ${percentage}%, #1e293b ${percentage}% 100%)`,
              boxShadow: `0 0 35px -8px ${color}35`,
            }}
            role="meter"
            aria-label="Dinero simulado disponible para hoy"
            aria-valuemin={0}
            aria-valuemax={result.initialDailyAllowance}
            aria-valuenow={result.todayAvailable}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-slate-950 p-2 shadow-inner transition-colors duration-500">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Puedes gastar</p>
                <p className="mt-0.5 text-2xl font-black tracking-tight text-white">
                  RD$ {formatAmountInput(result.todayAvailable)}
                </p>
                <p className="text-[10px] text-slate-400">hoy según tu plan</p>
              </div>
            </div>
          </div>

          {/* Status badge & explanation */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            {result.status === 'ON_TRACK' && <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Ritmo saludable</span>}
            {result.status === 'ADJUSTING' && <span className="inline-flex items-center gap-1 text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> Margen de hoy agotado (se ajusta mañana)</span>}
            {result.status === 'EXCEEDED' && <span className="inline-flex items-center gap-1 text-rose-400"><AlertTriangle className="h-3.5 w-3.5" /> Presupuesto mensual agotado</span>}
          </div>

          <p className="mt-2 text-[11px] text-slate-400 leading-snug">
            {result.status === 'ON_TRACK'
              ? 'Vas al ritmo previsto para llegar con margen a tu próximo cobro.'
              : result.status === 'ADJUSTING'
                ? 'Consumiste tu margen de hoy. Tu cuota diaria se recalcula mañana sin regaños.'
                : 'Se ha alcanzado el límite mensual programado.'}
          </p>

          <p className="mt-2 text-[10px] text-slate-500 italic">
            * No es tu saldo bancario ni tu sueldo completo; es el gasto variable seguro de hoy.
          </p>
        </div>
      </div>
    </div>
  );
}
