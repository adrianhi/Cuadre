import type { FinancialRow, ReportSummary } from './financial-report-data';

const MONTH_ABBRS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return monthKey;
  return `${MONTH_ABBRS[month - 1]} ${year}`;
}

export interface MonthlyCategoryRow {
  category: string;
  monthlyAmounts: Record<string, number>;
  total: number;
  average: number;
  momChangePercent: number | null;
}

export interface MonthlyCategoryMatrix {
  months: string[];
  monthLabels: string[];
  categories: MonthlyCategoryRow[];
  monthTotals: Record<string, number>;
  grandTotal: number;
  overallAverage: number;
  overallMomChangePercent: number | null;
}

function monthKeyFromDate(date: unknown): string | null {
  if (typeof date !== 'string') return null;
  const [, month, year] = date.split('/');
  return year && month ? `${year}-${month.padStart(2, '0')}` : null;
}

function addRow(target: Record<string, Record<string, number>>, row: FinancialRow, fallback?: string) {
  const month = monthKeyFromDate(row.Fecha) || fallback;
  if (!month) return;
  const category = row.Categoría || 'Sin categoría';
  target[category] ??= {};
  target[category][month] = (target[category][month] || 0) + Number(row.Monto || 0);
}

const change = (previous: number, current: number) => previous > 0
  ? (current - previous) / previous
  : current > 0 ? 1 : 0;

export function buildMonthlyCategoryMatrix(rows: FinancialRow[], summary: ReportSummary): MonthlyCategoryMatrix {
  const expenses = rows.filter((row) => row.Impacto === 'Gasto');
  const approved = expenses.filter((row) => row.Estado === 'Aprobada');
  const effective = approved.length ? approved : expenses.filter((row) => row.Estado !== 'Rechazada');
  const finalRows = effective.length ? effective : expenses;
  const rowMonths = [...new Set(finalRows.map((row) => monthKeyFromDate(row.Fecha))
    .filter((month): month is string => Boolean(month)))].sort();
  const values: Record<string, Record<string, number>> = {};
  const comparison = 'comparison' in summary ? summary.comparison : undefined;
  const previousMonth = comparison?.previousPeriod?.startDate?.slice(0, 7);
  const currentMonth = comparison?.currentPeriod?.startDate?.slice(0, 7);
  let months: string[];

  if (rowMonths.length >= 2) {
    months = rowMonths;
    finalRows.forEach((row) => addRow(values, row));
  } else if (previousMonth && currentMonth && previousMonth !== currentMonth && comparison?.categoryDeltas?.length) {
    months = [previousMonth, currentMonth].sort();
    comparison.categoryDeltas.forEach((delta) => {
      values[delta.name || 'Sin categoría'] = {
        [previousMonth]: Number(delta.previousTotal || 0),
        [currentMonth]: Number(delta.currentTotal || 0),
      };
    });
    summary.byCategory.forEach((item) => {
      const category = item.category || 'Sin categoría';
      values[category] ??= {};
      values[category][currentMonth] ??= Number(item.total || 0);
      values[category][previousMonth] ??= 0;
    });
  } else {
    const month = rowMonths[0] || currentMonth || summary.period || new Date().toISOString().slice(0, 7);
    months = [month];
    summary.byCategory.forEach((item) => {
      values[item.category || 'Sin categoría'] = { [month]: Number(item.total || 0) };
    });
    if (!summary.byCategory.length) finalRows.forEach((row) => addRow(values, row, month));
  }

  const categories = Object.entries(values).map(([category, monthlyAmounts]) => {
    const total = months.reduce((sum, month) => sum + (monthlyAmounts[month] || 0), 0);
    const last = months.length - 1;
    return {
      category, monthlyAmounts, total, average: months.length ? total / months.length : 0,
      momChangePercent: months.length >= 2
        ? change(monthlyAmounts[months[last - 1]] || 0, monthlyAmounts[months[last]] || 0) : null,
    };
  }).sort((left, right) => right.total - left.total);
  const monthTotals = Object.fromEntries(months.map((month) => [month,
    categories.reduce((sum, category) => sum + (category.monthlyAmounts[month] || 0), 0)]));
  const grandTotal = Object.values(monthTotals).reduce((sum, value) => sum + value, 0);
  const last = months.length - 1;
  return {
    months, monthLabels: months.map(formatMonthLabel), categories, monthTotals, grandTotal,
    overallAverage: months.length ? grandTotal / months.length : 0,
    overallMomChangePercent: months.length >= 2
      ? change(monthTotals[months[last - 1]] || 0, monthTotals[months[last]] || 0) : null,
  };
}
