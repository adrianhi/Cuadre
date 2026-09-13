import { useState } from 'react';
import { Calculator, Calendar, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateSimulatedMargin, SIMULATOR_PRESETS, type MarginSimulatorInput } from '../model/margin-simulator';

export function InteractiveMarginCalculator() {
  const [params, setParams] = useState<MarginSimulatorInput>({
    monthlyLimit: 50000,
    spentBeforeToday: 14000,
    spentToday: 850,
    commitments: 18000,
    daysRemaining: 12,
  });

  const [activePreset, setActivePreset] = useState<string>('preset-50k');
  const result = calculateSimulatedMargin(params);

  const applyPreset = (presetId: string) => {
    const preset = SIMULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(preset.id);
    setParams({
      monthlyLimit: preset.monthlyLimit,
      spentBeforeToday: preset.spentBeforeToday,
      spentToday: preset.spentToday,
      commitments: preset.commitments,
      daysRemaining: preset.daysRemaining,
    });
  };

  const updateParam = (field: keyof MarginSimulatorInput, value: number) => {
    setActivePreset('');
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const color = result.status === 'EXCEEDED'
    ? '#ef4444'
    : result.status === 'ADJUSTING'
      ? '#f59e0b'
      : '#10b981';

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
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                activePreset === preset.id
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
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
            <div>
              <label className="text-xs font-semibold text-slate-300">Límite mensual previsto</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">RD$</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={params.monthlyLimit}
                  onChange={(e) => updateParam('monthlyLimit', Number(e.target.value) || 0)}
                  aria-label="Límite mensual previsto"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-10 pr-3 text-sm font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Cobros fijos reservados</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">RD$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={params.commitments}
                  onChange={(e) => updateParam('commitments', Number(e.target.value) || 0)}
                  aria-label="Cobros fijos reservados"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-10 pr-3 text-sm font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Gastado antes de hoy</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">RD$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={params.spentBeforeToday}
                  onChange={(e) => updateParam('spentBeforeToday', Number(e.target.value) || 0)}
                  aria-label="Gastado antes de hoy"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Gastado hoy</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">RD$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={params.spentToday}
                  onChange={(e) => updateParam('spentToday', Number(e.target.value) || 0)}
                  aria-label="Gastado hoy"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Días para cobrar</label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={params.daysRemaining}
                  onChange={(e) => updateParam('daysRemaining', Math.max(1, Number(e.target.value) || 1))}
                  aria-label="Días restantes para cobrar"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Resta aplicada en vivo: </span>
            (RD$ {params.monthlyLimit.toLocaleString()} − RD$ {params.spentBeforeToday.toLocaleString()} acumulados − RD$ {params.commitments.toLocaleString()} compromisos) ÷ {params.daysRemaining} días = <strong className="text-emerald-400">RD$ {result.initialDailyAllowance.toLocaleString()}/día</strong>. Menos RD$ {params.spentToday.toLocaleString()} gastados hoy.
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

          {/* Conic Dial Meter */}
          <div
            className="mt-4 grid h-40 w-40 place-items-center rounded-full p-2.5 transition-all duration-500"
            style={{ background: `conic-gradient(${color} ${percentage}%, #1e293b ${percentage}% 100%)` }}
            role="meter"
            aria-label="Dinero simulado disponible para hoy"
            aria-valuemin={0}
            aria-valuemax={result.initialDailyAllowance}
            aria-valuenow={result.todayAvailable}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-slate-950 p-2 shadow-inner">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Puedes gastar</p>
                <p className="mt-0.5 text-2xl font-black tracking-tight text-white">
                  RD$ {result.todayAvailable.toLocaleString('es-DO')}
                </p>
                <p className="text-[10px] text-slate-400">hoy según tu plan</p>
              </div>
            </div>
          </div>

          {/* Status badge & explanation */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            {result.status === 'ON_TRACK' && (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ritmo saludable
              </span>
            )}
            {result.status === 'ADJUSTING' && (
              <span className="inline-flex items-center gap-1 text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Margen de hoy agotado (se ajusta mañana)
              </span>
            )}
            {result.status === 'EXCEEDED' && (
              <span className="inline-flex items-center gap-1 text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Presupuesto mensual agotado
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-slate-400 leading-snug">
            {result.status === 'ON_TRACK'
              ? 'Vas al ritmo previsto para llegar sin estrés a cobrar.'
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
