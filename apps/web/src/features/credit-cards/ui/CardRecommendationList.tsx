import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { CardRecommendation } from '@bills/contracts';
import { formatCardLast4, getBankTheme } from '../model/bank-theme';
import {
  ANTI_FINANCING_INFO,
  formatShortDate,
  getTrafficLightMeta,
} from '../model/traffic-light-helpers';

interface CardRecommendationListProps {
  cards: CardRecommendation[];
}

export function CardRecommendationList({ cards }: CardRecommendationListProps) {
  return (
    <div className="space-y-4 pt-1">
      {cards.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Otras tarjetas registradas
          </p>

          <div className="space-y-2">
            {cards.map((item) => {
              const meta = getTrafficLightMeta(item.status);
              const bank = getBankTheme(item.card.institutionCode);

              return (
                <div
                  key={item.card.id}
                  className={`rounded-2xl border ${meta.borderClass} ${meta.bgClass} p-3.5 space-y-2 transition`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold border ${bank.badgeClass}`}>
                        {bank.shortName}
                      </span>
                      <span className="font-bold text-xs text-foreground truncate">
                        {item.card.alias}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatCardLast4(item.card.cardLast4)}
                      </span>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.reason}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <span>
                      Días libres: <strong className={meta.textClass}>{item.freeFinancingDays} días</strong>
                    </span>
                    <span>
                      Corte: <strong className="text-foreground">{formatShortDate(item.nextClosingDate)}</strong>
                    </span>
                    <span>
                      Pagar antes de: <strong className="text-foreground">{formatShortDate(item.dueDate)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerta Anti-Financiamiento Educativa RD */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            {ANTI_FINANCING_INFO.title}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {ANTI_FINANCING_INFO.message}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>Tasa regular: {ANTI_FINANCING_INFO.statRate}. ¡Finánciate con el corte, no con intereses!</span>
        </div>
      </div>
    </div>
  );
}
