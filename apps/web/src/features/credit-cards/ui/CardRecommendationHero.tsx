import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { CardRecommendation } from '@bills/contracts';
import { cn } from '@/shared/lib';
import { Badge, Card, CardContent } from '@/shared/ui';
import { formatCardLast4, getBankTheme } from '../model/bank-theme';
import { formatShortDate } from '../model/traffic-light-helpers';

interface CardRecommendationHeroProps {
  recommendation: CardRecommendation;
}

export function CardRecommendationHero({ recommendation }: CardRecommendationHeroProps) {
  const { card, freeFinancingDays, dueDate, nextClosingDate, reason } = recommendation;
  const bankTheme = getBankTheme(card.institutionCode);

  return (
    <Card
      className={`relative overflow-hidden border bg-gradient-to-br ${bankTheme.cardGradient} ${bankTheme.borderClass} shadow-lg`}
    >
      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top bar: Bank badge & Card identifier */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className={cn('rounded-lg px-2.5 py-1 text-xs font-bold border', bankTheme.badgeClass)}
            >
              {bankTheme.name}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground font-mono">
              {formatCardLast4(card.cardLast4)}
            </span>
          </div>

          <Badge
            variant="success"
            className="gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          >
            <Sparkles className="h-3 w-3" />
            Mejor opción hoy
          </Badge>
        </div>

        {/* Alias & Giant Hero Metric */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            {card.alias}
          </h3>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 sm:p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              0% De Interés
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
              {freeFinancingDays} DÍAS DE FINANCIAMIENTO GRATIS
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Comprando hoy pagarás este consumo sin intereses hasta la fecha límite.
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3 text-xs text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <p className="leading-relaxed">{reason}</p>
        </div>

        {/* Cut Date & Due Date summary */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="rounded-xl border border-border/50 bg-muted/40 p-2.5">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <Clock className="h-3 w-3" /> Próximo corte
            </span>
            <p className="mt-1 font-bold text-foreground">
              {formatShortDate(nextClosingDate)}
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/40 p-2.5">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <Calendar className="h-3 w-3" /> Límite de pago
            </span>
            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
              {formatShortDate(dueDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
