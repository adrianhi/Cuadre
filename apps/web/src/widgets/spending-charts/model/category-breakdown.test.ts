import { describe, expect, it } from 'vitest';
import { buildCategoryBreakdown, visibleCategoryBreakdown } from './category-breakdown';

const rows = [
  { category: 'Renta', total: 45_000, count: 1, percentage: 90 },
  { category: 'Comida', total: 3_000, count: 4, percentage: 6 },
  { category: 'Transporte', total: 2_000, count: 3, percentage: 4 },
];

describe('interactive category breakdown', () => {
  it('recalculates totals and percentages from visible categories', () => {
    const base = buildCategoryBreakdown(rows);
    const result = visibleCategoryBreakdown(base, new Set(['Renta']));
    expect(result.originalTotal).toBe(50_000);
    expect(result.visibleTotal).toBe(5_000);
    expect(result.data.map((item) => [item.name, item.percentage])).toEqual([['Comida', 60], ['Transporte', 40]]);
  });

  it('keeps colors stable and supports hiding every category', () => {
    const base = buildCategoryBreakdown(rows);
    const originalColor = base[1].color;
    expect(visibleCategoryBreakdown(base, new Set(['Renta'])).data[0].color).toBe(originalColor);
    expect(visibleCategoryBreakdown(base, new Set(rows.map((item) => item.category)))).toMatchObject({ data: [], visibleTotal: 0 });
  });
});

