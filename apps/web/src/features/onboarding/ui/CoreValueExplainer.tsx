import { ArrowRightLeft, PiggyBank, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function CoreValueExplainer() {
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-background to-teal-500/[0.04] p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold text-foreground">El Poder del Método Cuadre</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        No somos una libreta de gastos ni te juzgamos por comprar un café. Cuadre es el piloto automático que protege tu tranquilidad financiera.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            <PiggyBank className="h-3.5 w-3.5 shrink-0" />
            <span>1. Págate primero</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Aparta tu ahorro quincenal antes de gastar. Queda blindado y fuera del dinero disponible.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold text-xs">
            <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
            <span>2. Ahorro ≠ Gasto</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Tus transferencias a cuentas de ahorro o entre tus propios bancos no se descuentan como gastos.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300 font-bold text-xs">
            <Zap className="h-3.5 w-3.5 shrink-0" />
            <span>3. Margen Diario</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Un número claro por día para gastar sin culpa ni estrés. Se recalcula solo con tus bancos.
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-background/80 border border-emerald-500/20 p-2.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span>
          <strong>Detección inteligente:</strong> Si en algún momento Cuadre lee una transferencia a tu ahorro o entre tus cuentas, podrás confirmarla como <em>"Entre mis cuentas"</em> con 1 toque.
        </span>
      </div>
    </div>
  );
}
