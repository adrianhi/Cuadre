import { useState } from 'react';
import { AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from '@/shared/ui';

interface CardTrafficLightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardTrafficLightDialog({ open, onOpenChange }: CardTrafficLightDialogProps) {
  const [corteDay, setCorteDay] = useState<number>(15);
  const todayDay = new Date().getDate();

  // Calculation: days until cut
  const daysSinceCorte = todayDay >= corteDay ? todayDay - corteDay : 30 - (corteDay - todayDay);
  const isRecommended = daysSinceCorte >= 1 && daysSinceCorte <= 10;
  const isCaution = daysSinceCorte > 10 && daysSinceCorte <= 24;
  const isAvoid = !isRecommended && !isCaution;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card p-6 sm:rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold">¿Con cuál tarjeta pago hoy?</DialogTitle>
              <DialogDescription className="text-xs">El semáforo inteligente de financiamiento a costo cero.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
            <label className="text-xs font-bold text-foreground block">
              Día del mes en que corta tu tarjeta:
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={31}
                value={corteDay}
                onChange={(e) => setCorteDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                className="h-10 text-center font-bold text-sm w-24"
              />
              <span className="text-xs text-muted-foreground">
                (Hoy es día {todayDay} del mes)
              </span>
            </div>

            {/* Diagnostic evaluation result */}
            <div className={`rounded-xl border p-3 flex items-start gap-3 transition-colors ${
              isRecommended
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : isCaution
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}>
              {isRecommended && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />}
              {isCaution && <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />}
              {isAvoid && <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />}
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {isRecommended && '🟢 ¡Excelente momento! (Semáforo Verde)'}
                  {isCaution && '🟡 Uso Regular (Semáforo Amarillo)'}
                  {isAvoid && '🔴 Espera al corte si puedes (Semáforo Rojo)'}
                </p>
                <p className="leading-snug">
                  {isRecommended && `Tu tarjeta cortó hace ${daysSinceCorte} días. Tienes hasta 50-54 días antes de pagar este consumo sin intereses.`}
                  {isCaution && `Tu tarjeta está a mitad de ciclo. Tienes entre 20 y 30 días para pagar.`}
                  {isAvoid && `Tu tarjeta corta en pocos días. Si compras hoy, este gasto saldrá en el corte actual y tendrás solo 15-20 días para pagarlo.`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <p className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              La regla de oro en bancos dominicanos
            </p>
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">Regla del día después:</strong> La mejor tarjeta para usar hoy es siempre aquella cuya <span className="underline decoration-emerald-500 decoration-2">fecha de corte fue ayer o antes de ayer</span> (Popular, Reservas, BHD o Qik).
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-10 rounded-xl text-xs font-bold"
            onClick={() => onOpenChange(false)}
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
