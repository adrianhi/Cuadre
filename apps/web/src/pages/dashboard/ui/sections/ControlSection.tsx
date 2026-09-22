import React, { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, CalendarCheck, Info, WalletCards } from 'lucide-react';
import type { PeriodSelection } from '@/entities/period';
import type { StatsSummary } from '@/entities/stat';
import { usePaydayRitual } from '@/entities/payday-ritual';
import { useCompletePaydayRitual } from '@/features/complete-payday-ritual';
import { PaydayRitualCard } from '@/widgets/payday-ritual';
import { Card, CardContent } from '@/shared/ui';
import { BudgetSection } from './BudgetSection';
import { AnalyticsSection } from './AnalyticsSection';

type ControlTab = 'budget' | 'analytics' | 'quincena';

interface ControlSectionProps {
  periodToolbar: ReactNode;
  currentPeriod: PeriodSelection;
  currency: string;
  hideBalances: boolean;
  stats: StatsSummary | null;
  statsError: unknown;
  loadingStats: boolean;
  onRefresh: () => void;
  onOpenExport?: () => void;
}

export const ControlSection: React.FC<ControlSectionProps> = ({
  periodToolbar,
  currentPeriod,
  currency,
  hideBalances,
  stats,
  statsError,
  loadingStats,
  onRefresh,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView: ControlTab = (() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'analytics' || viewParam === 'quincena') return viewParam;
    if (viewParam === 'budget') return 'budget';
    const tabParam = searchParams.get('tab');
    if (tabParam === 'analytics') return 'analytics';
    if (tabParam === 'quincena' || tabParam === 'payday') return 'quincena';
    return 'budget';
  })();

  const handleSelectView = (newView: ControlTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', newView);
      if (newView !== 'budget') {
        if (next.get('tab') !== 'recurring') next.delete('tab');
      }
      return next;
    }, { replace: true });
  };

  const activeCurrency = currency === 'USD' ? 'USD' : 'DOP';
  const paydayRitual = usePaydayRitual(activeCurrency);
  const completePaydayRitual = useCompletePaydayRitual(activeCurrency);

  return (
    <div className="w-full space-y-6">
      {/* Sticky Segmented Control */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 2xl:-mx-12 px-4 sm:px-6 lg:px-8 2xl:px-12 py-2.5 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="mx-auto max-w-md 2xl:max-w-lg rounded-2xl bg-muted/80 p-1 text-xs 2xl:text-sm font-semibold text-muted-foreground shadow-inner flex gap-1">
          <button
            type="button"
            onClick={() => handleSelectView('budget')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 2xl:py-2.5 transition-all ${
              activeView === 'budget'
                ? 'bg-card text-foreground font-bold shadow-sm'
                : 'hover:text-foreground hover:bg-card/40'
            }`}
            aria-pressed={activeView === 'budget'}
          >
            <WalletCards className="h-4 w-4" />
            <span>Presupuesto</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectView('analytics')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 2xl:py-2.5 transition-all ${
              activeView === 'analytics'
                ? 'bg-card text-foreground font-bold shadow-sm'
                : 'hover:text-foreground hover:bg-card/40'
            }`}
            aria-pressed={activeView === 'analytics'}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analítica</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectView('quincena')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 2xl:py-2.5 transition-all ${
              activeView === 'quincena'
                ? 'bg-card text-foreground font-bold shadow-sm'
                : 'hover:text-foreground hover:bg-card/40'
            }`}
            aria-pressed={activeView === 'quincena'}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Quincena</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeView === 'budget' && (
        <BudgetSection
          periodToolbar={periodToolbar}
          currentPeriod={currentPeriod}
          currency={currency}
          hideBalances={hideBalances}
        />
      )}

      {activeView === 'analytics' && (
        <AnalyticsSection
          periodToolbar={periodToolbar}
          currentPeriod={currentPeriod}
          stats={stats}
          statsError={statsError}
          loadingStats={loadingStats}
          currency={currency}
          hideBalances={hideBalances}
          onRefresh={onRefresh}
        />
      )}

      {activeView === 'quincena' && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl 2xl:text-3xl">
                Ritual de Quincena
              </h2>
              <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
                Distribuye tu quincena, aparta tus compromisos fijos y mantén el control.
              </p>
            </div>
            {periodToolbar}
          </div>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
            <div className="2xl:col-span-2">
              <PaydayRitualCard
                ritual={paydayRitual.data || null}
                loading={paydayRitual.isLoading}
                completing={completePaydayRitual.isPending}
                hideBalances={hideBalances}
                onComplete={(cycleKey) => completePaydayRitual.mutate(cycleKey)}
              />
            </div>

            <Card className="border-border/60 bg-muted/20 h-fit">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-foreground">El método de los dos ciclos en RD</p>
                  <p className="text-muted-foreground leading-relaxed">
                    En República Dominicana la mayoría de los cobros fijos caen en las fechas 15 y 30. Cuadre reserva automáticamente el dinero de tus compromisos quincenales para que tu Margen Seguro diario nunca te engañe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
