import { Check } from 'lucide-react';
import { formatCurrency } from '@/shared/lib';
import { Input } from '@/shared/ui';
import { COMMON_RD_SERVICES } from '../model/common-recurring-services';

interface RecurringServiceSelectorProps {
  selectedServices: string[];
  serviceAmounts: Record<string, string>;
  valid: boolean;
  onToggle: (id: string) => void;
  onAmountChange: (id: string, amount: string) => void;
}

export function RecurringServiceSelector({
  selectedServices,
  serviceAmounts,
  valid,
  onToggle,
  onAmountChange,
}: RecurringServiceSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-foreground">Selecciona tus cobros fijos habituales</h3>
        <p className="text-xs text-muted-foreground">
          Cuadre los reservará antes de calcular tu margen. Ninguno viene seleccionado.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
        {COMMON_RD_SERVICES.map((service) => {
          const selected = selectedServices.includes(service.id);
          return (
            <div
              key={service.id}
              className={`rounded-xl border transition-all ${
                selected
                  ? 'border-emerald-500/50 bg-emerald-500/[0.06] shadow-xs'
                  : 'border-border/60 bg-background/50'
              }`}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(service.id)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{service.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Aprox. {formatCurrency(service.defaultAmount, 'DOP')} / mes
                  </p>
                </div>
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                  selected
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-border bg-background'
                }`}>
                  {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </span>
              </button>
              {selected && (
                <label className="grid gap-1 border-t border-border/50 px-3 pb-3 pt-2 text-[11px] font-medium text-muted-foreground">
                  Monto mensual estimado (DOP)
                  <Input
                    type="number"
                    min="1"
                    max="999999999.99"
                    step="100"
                    value={serviceAmounts[service.id]}
                    onChange={(event) => onAmountChange(service.id, event.target.value)}
                    aria-invalid={Number(serviceAmounts[service.id]) <= 0}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      {!valid && (
        <p className="text-xs text-destructive">
          Cada cobro seleccionado debe tener un monto mayor que cero.
        </p>
      )}
    </div>
  );
}
