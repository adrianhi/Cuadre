import { useState } from 'react';
import { Gift, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/shared/lib';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from '@/shared/ui';

interface DobleSueldoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

export function DobleSueldoDialog({ open, onOpenChange, currency }: DobleSueldoDialogProps) {
  const [monthlySalary, setMonthlySalary] = useState<number>(50000);
  const [monthsWorked, setMonthsWorked] = useState<number>(12);

  // Dominican Regalía Pascual calculation: (monthlySalary * monthsWorked) / 12
  const estimatedDobleSueldo = (monthlySalary * Math.min(12, Math.max(1, monthsWorked))) / 12;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card p-6 sm:rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold">Calculadora de Doble Sueldo</DialogTitle>
              <DialogDescription className="text-xs">Regalía Pascual según el Código de Trabajo (Ley 16-92 RD).</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Tu salario mensual ordinario ({currency}):
              </label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value) || 0))}
                className="h-10 text-sm font-semibold"
                placeholder="Ej. 65000"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Meses laborados en la empresa en el año (1-12):
              </label>
              <Input
                type="number"
                min={1}
                max={12}
                value={monthsWorked}
                onChange={(e) => setMonthsWorked(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                className="h-10 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tu regalía estimada</p>
            <p className="text-2xl sm:text-3xl font-black text-primary">
              {formatCurrency(estimatedDobleSueldo, currency)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              A pagarse a más tardar el 20 de diciembre.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="leading-snug">
              <strong className="text-foreground">Protegido por ley:</strong> El salario de Navidad es inembargable y no está sujeto a descuentos de Seguridad Social (TSS) ni Impuesto Sobre la Renta (hasta el tope de 5 salarios mínimos).
            </p>
          </div>

          <Button
            type="button"
            className="w-full h-10 rounded-xl text-xs font-bold"
            onClick={() => onOpenChange(false)}
          >
            Listo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
