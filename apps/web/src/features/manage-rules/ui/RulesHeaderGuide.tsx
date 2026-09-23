import { useState } from 'react';
import { ChevronDown, ChevronUp, History, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

export function RulesHeaderGuide() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground sm:text-base">
                ¿Qué son las reglas y qué puedes lograr?
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatiza tu dinero para no clasificar las mismas compras una y otra vez.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isOpen ? 'Ocultar guía' : 'Mostrar guía'}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 pt-3 border-t border-border/40 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wand2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">1. Automatiza el futuro</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  Cada nueva alerta o compra de este comercio se etiquetará sola al llegar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <History className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">2. Aplica al pasado</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  Con un clic puedes reclasificar meses anteriores para cuadrar tus presupuestos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">3. Ediciones protegidas</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  Los movimientos que tú hayas cambiado a mano nunca se sobreescriben.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

