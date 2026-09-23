import { Lightbulb, Info } from 'lucide-react';
import type { BudgetSummaryDto } from '@/entities/budget';
import { BudgetOverviewCard, BudgetProgressList } from '@/widgets/budget-overview';
import { formatCurrency } from '@/shared/lib';
import { AsyncErrorState, Card, CardContent } from '@/shared/ui';

interface BudgetCategoriesTabProps {
  summary: BudgetSummaryDto | null;
  loading: boolean;
  isError: boolean;
  error: unknown;
  currency: string;
  hideBalances: boolean;
  onRefetch: () => void;
  onManage: () => void;
}

export function BudgetCategoriesTab({
  summary,
  loading,
  isError,
  error,
  currency,
  hideBalances,
  onRefetch,
  onManage,
}: BudgetCategoriesTabProps) {
  if (isError) {
    return (
      <Card>
        <CardContent className="p-0">
          <AsyncErrorState
            title="No pudimos cargar tu presupuesto"
            description="Tus límites guardados siguen disponibles."
            onRetry={onRefetch}
            error={error}
            area="presupuesto"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <BudgetOverviewCard
        summary={summary}
        loading={loading}
        hideBalances={hideBalances}
        onManage={onManage}
      />

      {/* Help Banner: Guide on categorization and limits */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">¿Cómo se calculan estos consumos?</p>
          <p className="text-muted-foreground leading-relaxed">
            Tus gastos se agrupan automáticamente según la categoría asignada a cada movimiento.
            Si tienes consumos en &ldquo;Otros&rdquo; o pendientes de categorizar, puedes editarlos en la pestaña de Movimientos para que se sumen a tus límites en tiempo real.
          </p>
        </div>
      </div>

      {summary?.hasBudget && (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-bold">Límites por categoría</p>
                <p className="text-xs text-muted-foreground">
                  Los pendientes se muestran sin consumir el límite.
                </p>
              </div>
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>

            <BudgetProgressList
              items={summary.categories}
              currency={currency}
              hideBalances={hideBalances}
            />

            {summary.unbudgetedSpent > 0 && (
              <div className="mt-4 rounded-xl bg-muted/60 p-3">
                <p className="text-xs font-bold">Gasto en categorías sin límite</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hideBalances ? '••••••' : formatCurrency(summary.unbudgetedSpent, currency)} · incluido en el límite global.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
