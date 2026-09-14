import { ChevronDown, WalletCards } from 'lucide-react';
import type { IncomeFrequency } from '@bills/contracts';
import { CurrencyAmountInput } from '@/shared/ui';
import { RecurringServiceSelector } from './RecurringServiceSelector';

interface OptionalFinancialDetailsProps {
  incomeAmount: string;
  frequency: IncomeFrequency;
  selectedServices: string[];
  serviceAmounts: Record<string, string>;
  validServices: boolean;
  onIncomeChange: (value: string) => void;
  onFrequencyChange: (value: IncomeFrequency) => void;
  onToggleService: (id: string) => void;
  onServiceAmountChange: (id: string, amount: string) => void;
}

export function OptionalFinancialDetails(props: OptionalFinancialDetailsProps) {
  return (
    <details className="group rounded-2xl border border-border/60 bg-muted/20">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
        <span className="flex items-center gap-2">
          <WalletCards className="h-4 w-4 text-primary" />
          <span>
            <span className="block text-sm font-bold">Ingresos y cobros fijos</span>
            <span className="block text-xs font-normal text-muted-foreground">Opcional · puedes completarlo más adelante</span>
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-5 border-t border-border/60 p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold">Ingreso neto habitual</h3>
            <p className="text-xs text-muted-foreground">
              Sirve para comparar ingresos y gastos. No cambia automáticamente tu límite mensual.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Monto por pago (DOP)
              <CurrencyAmountInput
                placeholder="Ej. 35,000.00"
                value={props.incomeAmount}
                onValueChange={props.onIncomeChange}
                className="font-mono text-base font-semibold"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Frecuencia de pago
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                value={props.frequency}
                onChange={(event) => props.onFrequencyChange(event.target.value as IncomeFrequency)}
              >
                <option value="BIWEEKLY_15_30">Quincenal (15 y 30)</option>
                <option value="MONTHLY">Mensual (1 cobro/mes)</option>
                <option value="WEEKLY">Semanal</option>
              </select>
            </label>
          </div>
        </div>

        <RecurringServiceSelector
          selectedServices={props.selectedServices}
          serviceAmounts={props.serviceAmounts}
          valid={props.validServices}
          onToggle={props.onToggleService}
          onAmountChange={props.onServiceAmountChange}
        />
      </div>
    </details>
  );
}
