import type { StatsSummary } from '@/entities/stat';
import { formatCurrency } from '@/shared/lib';
import { FINANCIAL_ARCHETYPES, type FinancialArchetype } from './archetypes';

export interface CuadreMerchant {
  name: string;
  visits: number;
  amount: number | null;
  rawAmount: number;
  percentage: number;
}

export interface CuadreCategory {
  name: string;
  percentage: number;
  amount: number | null;
  rawAmount: number;
  count: number;
}

export interface CuadreDelMesData {
  archetype: FinancialArchetype;
  savingsRate: number;
  hasIncomeData: boolean;
  totalSpent: number;
  totalIncome: number;
  netSavings: number;
  totalTransactions: number;
  topMerchant: CuadreMerchant | null;
  topCategory: CuadreCategory | null;
  daysUnderControl: number;
  daysWithoutExpense: number;
  totalDaysInPeriod: number;
  expenseChangePercent: number | null;
  isSpendingLess: boolean;
  currency: string;
  protectedMode: boolean;
  periodLabel: string;
}

const FOOD_ENTERTAINMENT_REGEX = /restaurante|delivery|comida|entretenimiento|bares|bebidas|ocio|cine|picadera/i;
const SUPERMARKET_REGEX = /supermercado|super|colmado|provisiones|mercado|hogar/i;

function determineArchetype(params: {
  savingsRate: number;
  hasIncomeData: boolean;
  byCategory: StatsSummary['byCategory'];
  byOrganization?: StatsSummary['byOrganization'];
  totalTransactions: number;
  daysWithoutExpense: number;
}): FinancialArchetype {
  const { savingsRate, hasIncomeData, byCategory, byOrganization, totalTransactions, daysWithoutExpense } = params;

  if (hasIncomeData && savingsRate > 25) {
    return FINANCIAL_ARCHETYPES.EL_ESTRATEGA;
  }

  const foodEntertainmentPct = byCategory
    .filter((item) => FOOD_ENTERTAINMENT_REGEX.test(item.category))
    .reduce((sum, item) => sum + (item.percentage || 0), 0);
  if (foodEntertainmentPct > 35) {
    return FINANCIAL_ARCHETYPES.EL_ALMA_DEL_CORO;
  }

  const supermarketPct = byCategory
    .filter((item) => SUPERMARKET_REGEX.test(item.category))
    .reduce((sum, item) => sum + (item.percentage || 0), 0);
  if (supermarketPct > 35) {
    return FINANCIAL_ARCHETYPES.EL_HOGARENO;
  }

  if (totalTransactions > 0 && totalTransactions <= 8 && daysWithoutExpense >= 10) {
    return FINANCIAL_ARCHETYPES.EL_ZEN;
  }

  const merchantCount = byOrganization?.length || 0;
  if (merchantCount >= 6 && (merchantCount / Math.max(totalTransactions, 1)) >= 0.4) {
    return FINANCIAL_ARCHETYPES.EL_EXPLORADOR;
  }

  return FINANCIAL_ARCHETYPES.EL_CUADRADOR;
}

export function calculateCuadreDelMes(
  stats: StatsSummary | null | undefined,
  protectedMode = true,
  periodLabelFallback = 'este mes'
): CuadreDelMesData {
  const totalSpent = stats?.totalAmount ?? 0;
  const totalIncome = stats?.totalIncome ?? 0;
  const hasIncomeData = typeof stats?.totalIncome === 'number' && stats.totalIncome > 0;
  const totalTransactions = stats?.totalTransactions ?? 0;
  const currency = stats?.currency ?? 'DOP';
  const periodLabel = stats?.period || periodLabelFallback;

  const netSavings = hasIncomeData ? totalIncome - totalSpent : 0;
  const savingsRate = hasIncomeData ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

  const totalDaysInPeriod = stats?.comparison?.currentPeriod?.days ?? 30;
  const activeSpendDates = new Set(stats?.dailyTrend?.filter((d) => d.total > 0).map((d) => d.date) ?? []);
  const daysWithoutExpense = Math.max(0, totalDaysInPeriod - activeSpendDates.size);

  const dailyAverage = stats?.dailyAverage || (totalSpent / Math.max(totalDaysInPeriod, 1));
  const daysOverDailyAverage = stats?.dailyTrend?.filter((d) => d.total > dailyAverage).length ?? 0;
  const daysUnderControl = Math.max(daysWithoutExpense, Math.min(totalDaysInPeriod, totalDaysInPeriod - daysOverDailyAverage));

  const sortedCategories = [...(stats?.byCategory ?? [])].sort((a, b) => b.total - a.total);
  const bestCategory = sortedCategories[0] ?? null;
  const topCategory: CuadreCategory | null = bestCategory
    ? {
        name: bestCategory.category,
        percentage: Math.round(bestCategory.percentage),
        amount: protectedMode ? null : bestCategory.total,
        rawAmount: bestCategory.total,
        count: bestCategory.count,
      }
    : null;

  const sortedOrgs = [...(stats?.byOrganization ?? [])].sort((a, b) => b.total - a.total);
  const bestMerchant = sortedOrgs[0] ?? null;
  const topMerchant: CuadreMerchant | null = bestMerchant
    ? {
        name: bestMerchant.organization,
        visits: bestMerchant.count,
        amount: protectedMode ? null : bestMerchant.total,
        rawAmount: bestMerchant.total,
        percentage: Math.round(bestMerchant.percentage),
      }
    : null;

  const expenseChangePercent = stats?.comparison?.expenseChangePercent ?? null;
  const isSpendingLess = expenseChangePercent !== null ? expenseChangePercent <= 0 : true;

  const archetype = determineArchetype({
    savingsRate,
    hasIncomeData,
    byCategory: stats?.byCategory ?? [],
    byOrganization: stats?.byOrganization ?? [],
    totalTransactions,
    daysWithoutExpense,
  });

  return {
    archetype,
    savingsRate,
    hasIncomeData,
    totalSpent,
    totalIncome,
    netSavings,
    totalTransactions,
    topMerchant,
    topCategory,
    daysUnderControl,
    daysWithoutExpense,
    totalDaysInPeriod,
    expenseChangePercent,
    isSpendingLess,
    currency,
    protectedMode,
    periodLabel,
  };
}

export function formatWhatsAppSummary(cuadre: CuadreDelMesData, protectedMode: boolean): string {
  const {
    archetype,
    periodLabel,
    topCategory,
    topMerchant,
    daysUnderControl,
    savingsRate,
    hasIncomeData,
    totalSpent,
    currency,
  } = cuadre;

  const lines: string[] = [
    '🎯 *Mi Cuadre del Mes en Cuadre* 🇩🇴',
    `📅 *Período:* ${periodLabel}`,
    '',
    `🏆 *Arquetipo:* ${archetype.name}`,
    `💬 _"${archetype.quote}"_`,
    '',
    '📊 *Mis Estadísticas Clave:*',
  ];

  if (topCategory) {
    const catAmount = !protectedMode ? ` (${formatCurrency(topCategory.rawAmount, currency)})` : '';
    lines.push(`• 👑 *Categoría reina:* ${topCategory.name} (${topCategory.percentage}%)${catAmount}`);
  }

  if (topMerchant) {
    const merchAmount = !protectedMode ? ` (${formatCurrency(topMerchant.rawAmount, currency)})` : '';
    lines.push(`• 🏪 *Parada favorita:* ${topMerchant.name} (${topMerchant.visits} visitas)${merchAmount}`);
  }

  lines.push(`• 🧘 *Días bajo control:* ${daysUnderControl} días`);

  if (hasIncomeData && savingsRate > 0) {
    lines.push(`• 📈 *Tasa de ahorro:* ${savingsRate}% de mis ingresos`);
  }

  if (!protectedMode && totalSpent > 0) {
    lines.push(`• 💳 *Gasto total:* ${formatCurrency(totalSpent, currency)}`);
  }

  lines.push(
    '',
    '✨ ¡Cuadra tus finanzas tú también en https://cuadre.app! 🇩🇴'
  );

  return lines.join('\n');
}
