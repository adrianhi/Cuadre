import { CreditCard, Sparkles, Users, Wand2 } from 'lucide-react';
import { getBankTheme, useCreditCardsSummary } from '@/features/credit-cards';
import { Badge } from '@/shared/ui';

interface QuickActionRailProps {
  onOpenTrafficLight: () => void;
  onOpenCoro: () => void;
  onOpenWrapped: () => void;
  onOpenSimulator: () => void;
}

export function QuickActionRail({
  onOpenTrafficLight,
  onOpenCoro,
  onOpenWrapped,
  onOpenSimulator,
}: QuickActionRailProps) {
  const { data: summary } = useCreditCardsSummary();
  const bestCard = summary?.bestCard;
  const bestBank = bestCard ? getBankTheme(bestCard.card.institutionCode) : null;

  const actions = [
    {
      id: 'traffic-light',
      title: bestCard ? bestCard.card.alias : 'Con cuál pago',
      subtitle: bestCard ? `${bestCard.freeFinancingDays} días gratis` : 'Semáforo de tarjetas',
      icon: CreditCard,
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      hasIndicator: Boolean(bestCard),
      badgeText: bestBank?.shortName,
      onClick: onOpenTrafficLight,
    },
    {
      id: 'coro',
      title: 'Modo Coro',
      subtitle: 'Cuentas compartidas',
      icon: Users,
      iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
      onClick: onOpenCoro,
    },
    {
      id: 'wrapped',
      title: 'Cuadre del Mes',
      subtitle: 'Tu resumen Wrapped',
      icon: Sparkles,
      iconBg: 'bg-primary/15 text-primary',
      onClick: onOpenWrapped,
    },
    {
      id: 'simulator',
      title: 'Simular gasto',
      subtitle: 'Prueba tu margen',
      icon: Wand2,
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      onClick: onOpenSimulator,
    },
  ];

  return (
    <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 xl:mx-0 xl:px-0">
      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar snap-x snap-mandatory xl:grid xl:grid-cols-4 xl:gap-3 xl:overflow-visible xl:p-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="group flex shrink-0 items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-2.5 pr-4 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-muted/30 active:scale-[0.98] snap-start xl:w-full xl:shrink"
            >
              <span className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl ${action.iconBg} transition group-hover:scale-105`}>
                <Icon className="h-4 w-4" />
                {action.hasIndicator && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold leading-snug text-foreground">
                    {action.title}
                  </p>
                  {action.badgeText && (
                    <Badge variant="success" className="shrink-0 rounded border-0 px-1 py-0.2 text-[9px] font-bold">
                      {action.badgeText}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-[11px] leading-tight text-muted-foreground">
                  {action.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
