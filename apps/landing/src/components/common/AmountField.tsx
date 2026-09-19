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
  prefixColor = 'text-slate-400',
  placeholder = '0.00',
  isBold = true,
  disabled = false,
}: AmountFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <label>{label}</label>
        {sublabel && <span className="text-[11px] font-normal text-slate-500">{sublabel}</span>}
      </div>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold select-none ${prefixColor}`}
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
          className={`w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/90 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
            isBold ? 'font-semibold' : 'font-normal'
          }`}
        />
      </div>
    </div>
  );
}

export interface NumberFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  icon?: ReactNode;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function NumberField({
  label,
  sublabel,
  value,
  onChange,
  icon,
  min = 1,
  max = 31,
  placeholder = '15',
  disabled = false,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <label>{label}</label>
        {sublabel && <span className="text-[11px] font-normal text-slate-500">{sublabel}</span>}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/90 ${
            icon ? 'pl-11' : 'pl-4'
          } pr-4 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
        />
      </div>
    </div>
  );
}
