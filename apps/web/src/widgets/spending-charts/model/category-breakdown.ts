export const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#ef4444'];

export interface CategoryBreakdownRow { category: string; total: number; count: number; percentage: number }
export interface CategoryChartRow { name: string; value: number; count: number; percentage: number; color: string }

export function buildCategoryBreakdown(rows: CategoryBreakdownRow[]): CategoryChartRow[] {
  return rows.map((row, index) => ({
    name: row.category, value: row.total, count: row.count, percentage: row.percentage,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

export function visibleCategoryBreakdown(base: CategoryChartRow[], excluded: ReadonlySet<string>) {
  const originalTotal = base.reduce((total, item) => total + item.value, 0);
  const visibleTotal = base.reduce((total, item) => total + (excluded.has(item.name) ? 0 : item.value), 0);
  const data = base.filter((item) => !excluded.has(item.name)).map((item) => ({
    ...item, percentage: visibleTotal > 0 ? Math.round(item.value / visibleTotal * 100) : 0,
  }));
  return { data, originalTotal, visibleTotal };
}

