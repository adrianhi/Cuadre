import type { ReactNode } from 'react';
import { formatAmountInput, formatAmountInputOnBlur } from '../../lib/formatters';

export interface AmountFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  prefixColor?: string;
  placeholder?: string;
  isBold?: boolean;
  disabled?: boolean;
}

export function AmountField({
  label,
  sublabel,
  value,
  onChange,
  prefix = 'RD$',
  prefixColor = 'text-emerald-400',
  placeholder = '0.00',
  isBold = true,
  disabled = false,
}: AmountFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <label className="truncate">{label}</label>
        {sublabel && <span className="text-[11px] font-normal text-slate-500 shrink-0 ml-2">{sublabel}</span>}
      </div>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black tracking-tight select-none z-10 ${prefixColor}`}
          aria-hidden="true"
        >
          {prefix}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(formatAmountInput(e.target.value))}
          onBlur={() => {
            if (value) onChange(formatAmountInputOnBlur(value));
          }}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/90 pl-14 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs ${
            isBold ? 'font-bold' : 'font-normal'
          }`}
        />
      </div>
    </div>
  );
}

export interface NumberStepperFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  icon?: ReactNode;
  min?: number;
  max?: number;
  quickOptions?: { label: string; value: number }[];
  placeholder?: string;
  disabled?: boolean;
}

export function NumberStepperField({
  label,
  sublabel,
  value,
  onChange,
  icon,
  min = 1,
  max = 31,
  quickOptions = [
    { label: '5 días', value: 5 },
    { label: '10 días', value: 10 },
    { label: '15 días (quincena)', value: 15 },
  ],
  disabled = false,
}: NumberStepperFieldProps) {
  const currentNum = parseInt(value, 10) || min;

  const handleStep = (delta: number) => {
    const nextVal = Math.min(max, Math.max(min, currentNum + delta));
    onChange(String(nextVal));
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      onChange('');
      return;
    }
    const num = Math.min(max, parseInt(raw, 10));
    onChange(String(num));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <label className="truncate">{label}</label>
        {sublabel && <span className="text-[11px] font-normal text-slate-500 shrink-0 ml-2">{sublabel}</span>}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Stepper Input box */}
        <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-950/90 p-1 shadow-xs sm:w-48 shrink-0 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={disabled || currentNum <= min}
            aria-label="Disminuir un día"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer font-bold text-lg select-none"
          >
            −
          </button>

          <div className="relative flex-1 flex items-center justify-center">
            {icon && (
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">
                {icon}
              </span>
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              onChange={handleManualInput}
              onBlur={() => {
                if (!value || parseInt(value, 10) < min) onChange(String(min));
              }}
              disabled={disabled}
              aria-label={label}
              className={`w-full h-9 bg-transparent ${
                icon ? 'pl-6' : 'pl-2'
              } pr-2 text-center text-sm font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={disabled || currentNum >= max}
            aria-label="Aumentar un día"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer font-bold text-lg select-none"
          >
            +
          </button>
        </div>

        {/* Quick Chip Presets */}
        {quickOptions && quickOptions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(String(opt.value))}
                  className={`h-11 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
