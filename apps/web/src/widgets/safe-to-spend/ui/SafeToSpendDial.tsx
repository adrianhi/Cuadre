import { Gauge, Settings2 } from 'lucide-react';
import type { SafeToSpendDto } from '@/entities/budget';
import { Badge, Button, Card, CardContent } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib';

const copy = {
  SURPLUS: 'Vas bien. Este es tu margen para hoy.',
  ADJUSTING: 'Tu plan se ajusta sin juicios para los días que quedan.',
  EXCEEDED: 'Tu presupuesto mensual ya se consumió.',
  UNSET: 'Define un presupuesto global para activar tu monto diario.',
} as const;

export function SafeToSpendDial(props: {
  value: SafeToSpendDto | null;
  loading: boolean;
  hideBalances: boolean;
  onManageBudget: () => void;
}) {
  if (props.loading) return <div className="h-64 animate-pulse rounded-3xl bg-muted" data-product-tour="safe-to-spend" />;
  const value = props.value;
  if (!value || value.status === 'UNSET') return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card" data-product-tour="safe-to-spend">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center lg:flex-row lg:items-center lg:justify-between lg:p-7 lg:text-left">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Gauge className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-black">Activa tu Margen Seguro Diario</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{copy.UNSET}</p>
          </div>
        </div>
        <Button className="shrink-0 gap-2" onClick={props.onManageBudget}>
          <Settings2 className="h-4 w-4" /> Definir límite mensual
        </Button>
      </CardContent>
    </Card>
  );

  const percentage = value.dailyAllowance > 0
    ? Math.min(100, Math.round(value.todayAvailable / value.dailyAllowance * 100))
    : 0;
  const color = value.status === 'EXCEEDED' ? '#ef4444'
    : value.status === 'ADJUSTING' ? '#f59e0b' : '#10b981';
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm" data-product-tour="safe-to-spend">
      <CardContent className="p-5 sm:p-7">
        {/* Mobile header (< lg) */}
        <div className="mb-4 flex w-full items-center justify-between lg:hidden">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Gauge className="h-4 w-4 text-primary" /> Margen Seguro Diario
          </div>
          <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
            {value.daysRemaining} días restantes
          </Badge>
        </div>

        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-8">
          {/* Left side: Circular meter gauge */}
          <div className="shrink-0">
            <div
              className="grid h-44 w-44 place-items-center rounded-full p-3 transition-all duration-500"
              style={{ background: `conic-gradient(${color} ${percentage}%, hsl(var(--muted)) ${percentage}% 100%)` }}
              role="meter"
              aria-label="Dinero disponible para hoy"
              aria-valuemin={0}
              aria-valuemax={value.dailyAllowance}
              aria-valuenow={value.todayAvailable}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-card text-center shadow-inner">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Puedes gastar</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    {props.hideBalances ? '••••••' : formatCurrency(value.todayAvailable, value.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">hoy según tu plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Status explanation, remaining days, reserve badge, CTA */}
          <div className="mt-5 flex flex-1 flex-col items-center text-center lg:mt-0 lg:items-start lg:text-left">
            {/* Desktop header row (lg+) */}
            <div className="hidden w-full items-center justify-between lg:flex">
              <div className="flex items-center gap-2 text-base font-bold">
                <Gauge className="h-5 w-5 text-primary" /> Margen Seguro Diario
              </div>
              <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                {value.daysRemaining} días restantes
              </Badge>
            </div>

            <p className="mt-2 text-sm font-medium text-foreground lg:mt-3">
              {copy[value.status]}
            </p>

            {value.futureConfirmedCommitments > 0 && (
              <p className="mt-2.5 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {props.hideBalances ? 'Reservas próximas incluidas' : `${formatCurrency(value.futureConfirmedCommitments, value.currency)} reservados para cobros próximos`}
              </p>
            )}

            {value.status === 'ADJUSTING' && value.nextDailyAllowance > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Mañana: {props.hideBalances ? '••••••' : formatCurrency(value.nextDailyAllowance, value.currency)} por día.
              </p>
            )}

            <div className="mt-4 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border/70 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5"
                onClick={props.onManageBudget}
              >
                <Settings2 className="h-3.5 w-3.5" /> Administrar presupuesto
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
