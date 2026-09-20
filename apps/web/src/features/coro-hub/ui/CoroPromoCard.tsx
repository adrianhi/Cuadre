import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, ChevronRight, Link as LinkIcon, Plus, Sparkles, Users } from 'lucide-react';
import { coroKeys, coroService } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, Card, CardContent } from '@/shared/ui';

interface CoroPromoCardProps {
  onOpenCoro: (coroId?: string) => void;
}

export function CoroPromoCard({ onOpenCoro }: CoroPromoCardProps) {
  const { data: coros = [], isLoading } = useQuery({
    queryKey: coroKeys.list(),
    queryFn: () => coroService.list(),
    staleTime: 30_000,
  });

  const activeCoros = coros.filter((c) => c.status === 'ACTIVE');
  const hasCoros = coros.length > 0;

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/[0.05] shadow-sm transition hover:border-primary/40">
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                  Modo Coro
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  <Sparkles className="h-3 w-3" />
                  {hasCoros ? `${activeCoros.length} activo${activeCoros.length === 1 ? '' : 's'}` : 'Nuevo'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Divide viajes, cenas y salidas con amigos sin fricción. Cuadre calcula quién le debe a quién en segundos.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => onOpenCoro()}
            className="h-10 shrink-0 gap-2 rounded-xl text-xs font-bold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{hasCoros ? 'Ver mis coros' : 'Crear primer coro'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Feature pillars: What you can do here */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-1">
          <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 p-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
              🏖️
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Viajes y cenas</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Sin notas ni calculadoras. División justa de la cuenta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 p-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
              <LinkIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Cero registro</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Tus amigos entran con tu enlace privado y suman sus gastos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 p-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Copia de cuentas</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Popular, BHD, Reservas y Qik listos para transferir con 1 toque.
              </p>
            </div>
          </div>
        </div>

        {/* If user has active coros: show interactive quick strip */}
        {!isLoading && activeCoros.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tus coros en curso
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {activeCoros.slice(0, 2).map((coro) => (
                <Button
                  type="button"
                  variant="outline"
                  key={coro.id}
                  onClick={() => onOpenCoro(coro.id)}
                  className="h-auto min-w-0 items-center justify-between gap-3 whitespace-normal rounded-xl border-border/60 bg-card p-3 text-left hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{coro.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {coro.participantCount} personas · {coro.expenseCount} gastos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary">
                      {formatCurrency(coro.totalAmount, coro.currency)}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground">
                      Ver coro <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
