import React from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib';
import type { StatsSummary } from '@/entities/stat';
import { categoryHexColor, useCategoryCatalog } from '@/entities/category';
import { buildCategoryBreakdown, visibleCategoryBreakdown } from '../model/category-breakdown';

interface CategoryBreakdownChartProps {
  stats: StatsSummary | null;
  currency: string;
}

interface CategoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { color: string; name: string; value: number; count: number; percentage: number };
  }>;
  currency: string;
}

function CategoryTooltip({ active, payload, currency }: CategoryTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return <div className="rounded-xl border bg-popover/95 p-3 text-xs shadow-xl backdrop-blur">
    <div className="flex items-center gap-2 font-semibold text-popover-foreground"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /><span>{item.name}</span></div>
    <div className="mt-1.5 flex items-baseline justify-between gap-4 text-muted-foreground"><span>Total:</span><span className="font-bold text-foreground">{formatCurrency(item.value, currency)}</span></div>
    <div className="flex items-baseline justify-between gap-4 text-muted-foreground"><span>Transacciones:</span><span className="font-medium text-foreground">{item.count}</span></div>
    <div className="flex items-baseline justify-between gap-4 text-muted-foreground"><span>Porcentaje:</span><span className="font-semibold text-primary">{item.percentage}%</span></div>
  </div>;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ stats, currency }) => {
  const categories = useCategoryCatalog(Boolean(stats));
  const baseData = React.useMemo(() => {
    if (!stats || !stats.byCategory || stats.byCategory.length === 0) return [];
    const colors = new Map((categories.data || []).map((item) => [item.label, categoryHexColor(item.colorKey)]));
    return buildCategoryBreakdown(stats.byCategory).map((item) => ({ ...item, color: colors.get(item.name) || item.color }));
  }, [stats, categories.data]);
  const signature = `${currency}:${stats?.period || ''}:${baseData.map((item) => `${item.name}:${item.value}`).join('|')}`;
  const [exclusionState, setExclusionState] = React.useState<{ signature: string; values: Set<string> }>({
    signature: '', values: new Set(),
  });
  const excluded = exclusionState.signature === signature ? exclusionState.values : new Set<string>();
  const { data, originalTotal, visibleTotal } = visibleCategoryBreakdown(baseData, excluded);
  const toggle = (name: string) => setExclusionState((current) => {
    const values = new Set(current.signature === signature ? current.values : []);
    if (values.has(name)) values.delete(name); else values.add(name);
    return { signature, values };
  });
  const reset = () => setExclusionState({ signature, values: new Set() });

  return (
    <Card className="border-border/60 shadow-sm flex flex-col justify-between" data-product-tour="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Gastos por Categoría</CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.length} de {baseData.length} categorías
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {baseData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No hay gastos registrados en este período.
          </div>
        ) : (
          <div className="space-y-3">
            {excluded.size > 0 && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs">
              <span>Mostrando <strong>{formatCurrency(visibleTotal, currency)}</strong> de {formatCurrency(originalTotal, currency)} · {excluded.size} oculta{excluded.size === 1 ? '' : 's'}</span>
              <button type="button" onClick={reset} className="flex items-center gap-1 font-semibold text-primary hover:underline"><RotateCcw className="h-3.5 w-3.5" />Mostrar todas</button>
            </div>}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-64 w-full sm:w-1/2">
              {data.length === 0 ? <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <EyeOff className="h-6 w-6" /><span>No hay categorías visibles.</span>
                <button type="button" onClick={reset} className="font-semibold text-primary hover:underline">Mostrar todas</button>
              </div> : <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>}
            </div>

            {/* List / Legend */}
            <div className="w-full sm:w-1/2 space-y-2 max-h-60 overflow-y-auto pr-1">
              {baseData.map((cat) => {
                const hidden = excluded.has(cat.name);
                const visiblePercentage = visibleTotal > 0 ? Math.round(cat.value / visibleTotal * 100) : 0;
                return <button
                  type="button"
                  key={cat.name}
                  aria-pressed={hidden}
                  aria-label={`${hidden ? 'Mostrar' : 'Ocultar'} ${cat.name}`}
                  onClick={() => toggle(cat.name)}
                  className={`flex w-full items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/50 transition-colors ${hidden ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-2 truncate max-w-[130px]" title={cat.name}>
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={`font-medium truncate ${hidden ? 'line-through' : ''}`}>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-muted-foreground">{hidden ? '—' : `${visiblePercentage}%`}</span>
                    <span className="font-semibold">{formatCurrency(cat.value, currency)}</span>
                  </div>
                </button>;
              })}
            </div>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
