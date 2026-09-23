import { CheckCircle2, Plus, Sparkles, Wallet } from "lucide-react";
import type { PaydayRitualDto } from "@/entities/payday-ritual";
import { Button, Card, CardContent } from "@/shared/ui";
import { formatCurrency } from "@/shared/lib";

export function PaydayRitualCard(props: {
  ritual: PaydayRitualDto | null;
  loading: boolean;
  completing: boolean;
  hideBalances: boolean;
  onComplete: (cycleKey: string) => void;
  onConfigureIncome?: () => void;
}) {
  if (props.loading)
    return <div className="h-32 animate-pulse rounded-2xl bg-muted" />;
  const ritual = props.ritual;

  const money = (value: number) =>
    props.hideBalances
      ? "••••••"
      : formatCurrency(value, ritual?.currency || "DOP");

  const getCycleTitle = () => {
    if (!ritual) return "Ritual de quincena";
    const startDay = ritual.cycleStart
      ? Number(ritual.cycleStart.slice(8, 10))
      : 15;
    const endDay = ritual.cycleEnd ? Number(ritual.cycleEnd.slice(8, 10)) : 30;
    const refDate = ritual.cycleStart
      ? new Date(`${ritual.cycleStart}T12:00:00Z`)
      : new Date();
    const month = new Intl.DateTimeFormat("es-DO", {
      month: "long",
      timeZone: "UTC",
    }).format(refDate);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const daysLabel =
      ritual.daysRemaining === 1
        ? "1 día restante"
        : `${ritual.daysRemaining} días restantes`;
    return `Ciclo del ${startDay} al ${endDay} de ${capitalizedMonth} · ${daysLabel}`;
  };

  if (
    !ritual ||
    !ritual.eligible ||
    ritual.status === "UNAVAILABLE" ||
    !ritual.cycleKey
  ) {
    return (
      <Card className="overflow-hidden border-border/60 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Configura tus ingresos para activar el Ritual
                </h3>
                <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                  El Ritual de Quincena te ayuda a apartar tus cobros fijos en
                  cada corte (días 15 y 30) y calcular tu margen diario real.
                  Para activarlo, agrega tu salario o nómina con frecuencia
                  quincenal.
                </p>
              </div>
            </div>
            {props.onConfigureIncome && (
              <Button
                onClick={props.onConfigureIncome}
                className="min-h-11 shrink-0 gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Configurar ingreso</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const cycleTitle = getCycleTitle();

  if (ritual.status === "COMPLETED") {
    return (
      <Card className="overflow-hidden border-emerald-500/30 bg-emerald-500/5 shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {cycleTitle}
                </p>
                <h3 className="text-lg font-black text-foreground">
                  Quincena revisada
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Ingreso planificado
              </p>
              <p className="font-bold">{money(ritual.plannedIncome)}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                Ingreso planificado para esta quincena según tus fuentes
                declaradas
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gastos fijos</p>
              <p className="font-bold">
                {money(ritual.paidFixed + ritual.futureFixed)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Otros gastos</p>
              <p className="font-bold">{money(ritual.otherSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Libre según tu plan
              </p>
              <p className="font-black text-primary">
                {money(ritual.available)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Has completado la revisión de este ciclo. Tu guía diaria disponible
            es {money(ritual.dailyAvailable)}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-card to-primary/10 shadow-xs">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                {cycleTitle}
              </p>
              <h3 className="text-lg font-black">Tu quincena está lista</h3>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Ingreso planificado</p>
            <p className="font-bold">{money(ritual.plannedIncome)}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
              Ingreso planificado para esta quincena según tus fuentes
              declaradas
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gastos fijos</p>
            <p className="font-bold">
              {money(ritual.paidFixed + ritual.futureFixed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Otros gastos</p>
            <p className="font-bold">{money(ritual.otherSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Libre según tu plan</p>
            <p className="font-black text-primary">{money(ritual.available)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tu guía diaria para el resto del ciclo es{" "}
          {money(ritual.dailyAvailable)}. No representa el saldo de tu banco.
        </p>
        {ritual.overage > 0 && (
          <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            El plan supera el ingreso por {money(ritual.overage)}.
          </p>
        )}
        <Button
          className="mt-4 w-full gap-2"
          disabled={props.completing}
          onClick={() => props.onComplete(ritual.cycleKey!)}
        >
          <CheckCircle2 className="h-4 w-4" />
          {props.completing ? "Guardando…" : "Marcar quincena revisada"}
        </Button>
      </CardContent>
    </Card>
  );
}
