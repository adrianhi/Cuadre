import { useState } from 'react';
import { Calculator, Calendar, Gauge, AlertTriangle, CheckCircle2, ArrowRight } from './icons';
import { formatAmountInput, formatAmountInputOnBlur, parseAmountInput } from '../lib/formatters';

interface QuincenaForm {
  periodIncome: string;
  fixedCommitments: string;
  daysRemaining: string;
  cycleType: 'QUINCENAL' | 'MENSUAL';
}

interface QuincenaResult {
  discretionaryBudget: number;
  dailySafeMargin: number;
  totalIncome: number;
  commitments: number;
  days: number;
  status: 'HEALTHY' | 'MODERATE' | 'TIGHT' | 'EXCEEDED';
  ratio: number;
}

const PRESETS = [
  {
    id: 'rd-30k',
    label: 'RD$ 30,000 / quincena',
    income: 30000,
    commitments: 16000,
    days: 12,
  },
  {
    id: 'rd-50k',
    label: 'RD$ 50,000 / quincena',
    income: 50000,
    commitments: 24000,
    days: 10,
  },
  {
    id: 'rd-75k',
    label: 'RD$ 75,000 / quincena',
    income: 75000,
    commitments: 38000,
    days: 14,
  },
];

function calculateQuincena(form: QuincenaForm): QuincenaResult {
  const totalIncome = Number(parseAmountInput(form.periodIncome)) || 0;
  const commitments = Number(parseAmountInput(form.fixedCommitments)) || 0;
  const days = Math.max(1, Number(form.daysRemaining) || 1);

  const discretionaryBudget = Math.max(0, totalIncome - commitments);
  const dailySafeMargin = Math.floor(discretionaryBudget / days);

  const ratio = totalIncome > 0 ? (commitments / totalIncome) * 100 : 0;

  let status: QuincenaResult['status'] = 'HEALTHY';
  if (totalIncome <= commitments) {
    status = 'EXCEEDED';
  } else if (ratio > 75) {
    status = 'TIGHT';
  } else if (ratio > 55) {
    status = 'MODERATE';
  }

  return {
    discretionaryBudget,
    dailySafeMargin,
    totalIncome,
    commitments,
    days,
    status,
    ratio,
  };
}

export function InteractiveQuincenaCalculator() {
  const [form, setForm] = useState<QuincenaForm>({
    periodIncome: formatAmountInputOnBlur(40000),
    fixedCommitments: formatAmountInputOnBlur(22000),
    daysRemaining: '11',
    cycleType: 'QUINCENAL',
  });

  const [activePreset, setActivePreset] = useState<string>('');

  const result = calculateQuincena(form);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setActivePreset(preset.id);
    setForm({
      periodIncome: formatAmountInputOnBlur(preset.income),
      fixedCommitments: formatAmountInputOnBlur(preset.commitments),
      daysRemaining: String(preset.days),
      cycleType: 'QUINCENAL',
    });
  };

  const updateAmount = (field: 'periodIncome' | 'fixedCommitments', val: string) => {
    setActivePreset('');
    setForm((prev) => ({ ...prev, [field]: formatAmountInput(val) }));
  };

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-slate-950/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Calculadora de Quincena y Margen Diario</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Proyecta cuánto dinero libre tienes para gastar cada día hasta tu próximo depósito bancario.
          </p>
        </div>

        {/* Cycle Toggle */}
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, cycleType: 'QUINCENAL', daysRemaining: '11' }))}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              form.cycleType === 'QUINCENAL'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quincenal (15 y 30)
          </button>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, cycleType: 'MENSUAL', daysRemaining: '24' }))}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              form.cycleType === 'MENSUAL'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensual (1 cobro)
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Ejemplos típicos en RD:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
              activePreset === preset.id
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Grid: Inputs + Output */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Income */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Sueldo neto en este cobro ({form.cycleType === 'QUINCENAL' ? 'Esta quincena' : 'Este mes'})</span>
              <span className="text-[11px] font-normal text-slate-500">Tras TSS e impuestos</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                RD$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={form.periodIncome}
                onChange={(e) => updateAmount('periodIncome', e.target.value)}
                onBlur={() => setForm((p) => ({ ...p, periodIncome: formatAmountInputOnBlur(p.periodIncome) }))}
                className="w-full h-11 bg-slate-950/90 border border-slate-800 text-white pl-13 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="40,000"
              />
            </div>
          </div>

          {/* Commitments */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Compromisos fijos que debes pagar en este ciclo</span>
              <span className="text-[11px] font-normal text-slate-500">Alquiler, préstamos, luz, colegios</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">
                RD$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={form.fixedCommitments}
                onChange={(e) => updateAmount('fixedCommitments', e.target.value)}
                onBlur={() => setForm((p) => ({ ...p, fixedCommitments: formatAmountInputOnBlur(p.fixedCommitments) }))}
                className="w-full h-11 bg-slate-950/90 border border-slate-800 text-white pl-13 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="22,000"
              />
            </div>
          </div>

          {/* Days Remaining */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Días restantes para el próximo depósito</span>
              <span className="text-[11px] font-normal text-slate-500">Normalmente día 15 o 30</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="number"
                min="1"
                max="31"
                value={form.daysRemaining}
                onChange={(e) => {
                  setActivePreset('');
                  setForm((p) => ({ ...p, daysRemaining: e.target.value }));
                }}
                className="w-full h-11 bg-slate-950/90 border border-slate-800 text-white pl-10 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="11"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            💡 En República Dominicana, si el día 15 o 30 coincide con sábado, domingo o día feriado, tu empresa o banco suele acreditar los fondos el día hábil anterior.
          </p>
        </div>

        {/* Result Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-500/20 bg-slate-950/90 p-5 shadow-xl sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Margen Diario Seguro</span>
            <Gauge className="h-4 w-4 text-emerald-400" />
          </div>

          {/* Primary Metric */}
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              RD$ {result.dailySafeMargin.toLocaleString('es-DO')}
              <span className="text-xs font-semibold text-slate-400 ml-1.5 font-normal">/ día</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Gasto variable máximo permitido por día para no descuadrar tu quincena.
            </p>
          </div>

          {/* Breakdown summary */}
          <div className="rounded-xl bg-slate-900/80 p-3.5 space-y-2 text-xs border border-slate-800/60">
            <div className="flex justify-between items-center text-slate-300">
              <span>Fondo libre quincenal:</span>
              <span className="font-bold text-white">RD$ {result.discretionaryBudget.toLocaleString('es-DO')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Compromisos comprometidos:</span>
              <span className="text-rose-300">{result.ratio.toFixed(0)}% del ingreso</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Horizonte de cobertura:</span>
              <span className="text-slate-200">{result.days} días</span>
            </div>
          </div>

          {/* Status feedback */}
          <div className="flex items-center gap-2 text-xs font-semibold pt-1">
            {result.status === 'HEALTHY' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Quincena holgada y equilibrada
              </span>
            )}
            {result.status === 'MODERATE' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Ritmo estándar manejable
              </span>
            )}
            {result.status === 'TIGHT' && (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Más del 75% comprometido en gastos fijos
              </span>
            )}
            {result.status === 'EXCEEDED' && (
              <span className="inline-flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="h-4 w-4" /> Compromisos superan el sueldo de este ciclo
              </span>
            )}
          </div>

          {/* CTA to automation */}
          <div className="pt-2">
            <a
              href="/#beta-waitlist"
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all text-center"
            >
              <span>Automatizar con mis bancos en Cuadre</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
