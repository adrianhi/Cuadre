import { describe, it, expect } from 'vitest';
import type { StatsSummary } from '@/entities/stat';
import { calculateCuadreDelMes, formatWhatsAppSummary } from './wrapped-calculator';

describe('wrapped-calculator', () => {
  const baseStats: StatsSummary = {
    period: '2026-08',
    totalAmount: 50000,
    totalIncome: 80000,
    totalTransactions: 25,
    approvedCount: 25,
    rejectedCount: 0,
    currency: 'DOP',
    dailyAverage: 1666.67,
    insights: [],
    byCategory: [
      { category: 'Servicios', total: 15000, count: 5, percentage: 30 },
      { category: 'Transporte', total: 10000, count: 4, percentage: 20 },
    ],
    byOrganization: [
      { organization: 'Edesur', total: 15000, count: 2, percentage: 30 },
      { organization: 'Uber', total: 10000, count: 4, percentage: 20 },
    ],
    dailyTrend: [
      { date: '2026-08-01', total: 2000, count: 1 },
      { date: '2026-08-05', total: 15000, count: 1 },
      { date: '2026-08-15', total: 1000, count: 2 },
    ],
    comparison: {
      previousTotalAmount: 55000,
      previousTotalIncome: 75000,
      expenseChangePercent: -9.09,
      incomeChangePercent: 6.67,
      expenseChangeAmount: -5000,
      currentPeriod: {
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        days: 31,
        totalAmount: 50000,
        totalIncome: 80000,
        dailyAverage: 1612.9,
        transactionCount: 25,
      },
      previousPeriod: {
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        days: 31,
        totalAmount: 55000,
        totalIncome: 75000,
        dailyAverage: 1774.19,
        transactionCount: 28,
      },
      categoryDeltas: [],
      merchantDeltas: [],
    },
  };

  it('determines EL_ESTRATEGA when savings rate is greater than 25%', () => {
    // Income = 100,000, Spent = 60,000 -> Savings = 40,000 (40%)
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 100000,
      totalAmount: 60000,
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_ESTRATEGA');
    expect(result.savingsRate).toBe(40);
    expect(result.hasIncomeData).toBe(true);
  });

  it('determines EL_ALMA_DEL_CORO when dining and entertainment exceed 35%', () => {
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 0, // No income data to avoid EL_ESTRATEGA
      byCategory: [
        { category: 'Restaurantes & Delivery', total: 30000, count: 12, percentage: 40 },
        { category: 'Entretenimiento', total: 10000, count: 3, percentage: 15 },
        { category: 'Otros', total: 10000, count: 5, percentage: 45 },
      ],
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_ALMA_DEL_CORO');
  });

  it('determines EL_HOGARENO when supermarket and home exceed 35%', () => {
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 0,
      byCategory: [
        { category: 'Supermercado', total: 25000, count: 6, percentage: 50 },
        { category: 'Servicios', total: 25000, count: 4, percentage: 50 },
      ],
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_HOGARENO');
  });

  it('determines EL_ZEN when transaction count is low and control is high', () => {
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 0,
      totalTransactions: 4,
      byCategory: [
        { category: 'Servicios', total: 5000, count: 2, percentage: 25 },
      ],
      dailyTrend: [
        { date: '2026-08-01', total: 2500, count: 1 },
        { date: '2026-08-15', total: 2500, count: 1 },
      ],
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_ZEN');
    expect(result.daysWithoutExpense).toBeGreaterThanOrEqual(10);
  });

  it('determines EL_EXPLORADOR when merchant variety is high', () => {
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 0,
      totalTransactions: 15,
      byCategory: [
        { category: 'Servicios', total: 5000, count: 1, percentage: 10 },
      ],
      byOrganization: [
        { organization: 'Org A', total: 5000, count: 1, percentage: 15 },
        { organization: 'Org B', total: 4000, count: 1, percentage: 14 },
        { organization: 'Org C', total: 3000, count: 1, percentage: 13 },
        { organization: 'Org D', total: 3000, count: 1, percentage: 13 },
        { organization: 'Org E', total: 2000, count: 1, percentage: 12 },
        { organization: 'Org F', total: 2000, count: 1, percentage: 12 },
        { organization: 'Org G', total: 1000, count: 1, percentage: 10 },
      ],
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_EXPLORADOR');
  });

  it('determines EL_CUADRADOR when metrics are balanced', () => {
    const stats: StatsSummary = {
      ...baseStats,
      totalIncome: 50000,
      totalAmount: 45000, // 10% savings rate (<= 25%)
      totalTransactions: 16,
      byCategory: [
        { category: 'Servicios', total: 15000, count: 4, percentage: 30 },
        { category: 'Transporte', total: 15000, count: 4, percentage: 30 },
      ],
      byOrganization: [
        { organization: 'Banco', total: 20000, count: 4, percentage: 45 },
      ],
    };

    const result = calculateCuadreDelMes(stats, true);
    expect(result.archetype.id).toBe('EL_CUADRADOR');
  });

  it('hides sensitive amounts when protectedMode is true', () => {
    const protectedResult = calculateCuadreDelMes(baseStats, true);
    expect(protectedResult.protectedMode).toBe(true);
    expect(protectedResult.topCategory?.amount).toBeNull();
    expect(protectedResult.topCategory?.rawAmount).toBe(15000);
    expect(protectedResult.topMerchant?.amount).toBeNull();
    expect(protectedResult.topMerchant?.rawAmount).toBe(15000);

    const unprotectedResult = calculateCuadreDelMes(baseStats, false);
    expect(unprotectedResult.protectedMode).toBe(false);
    expect(unprotectedResult.topCategory?.amount).toBe(15000);
    expect(unprotectedResult.topMerchant?.amount).toBe(15000);
  });

  it('handles null or undefined stats gracefully with default fallback values', () => {
    const fallback = calculateCuadreDelMes(null, true, 'Agosto 2026');
    expect(fallback.archetype.id).toBe('EL_CUADRADOR');
    expect(fallback.totalSpent).toBe(0);
    expect(fallback.totalTransactions).toBe(0);
    expect(fallback.topCategory).toBeNull();
    expect(fallback.topMerchant).toBeNull();
    expect(fallback.periodLabel).toBe('Agosto 2026');
  });

  it('formats WhatsApp summary without sensitive amounts in protected mode', () => {
    const cuadre = calculateCuadreDelMes(baseStats, true);
    const summary = formatWhatsAppSummary(cuadre, true);

    expect(summary).toContain('🎯 *Mi Cuadre del Mes en Cuadre* 🇩🇴');
    expect(summary).toContain(cuadre.archetype.name);
    expect(summary).toContain('https://cuadre.app');
    expect(summary).not.toContain('RD$ 50,000.00');
    expect(summary).not.toContain('RD$ 15,000.00');
  });

  it('formats WhatsApp summary with amounts when protected mode is disabled', () => {
    const cuadre = calculateCuadreDelMes(baseStats, false);
    const summary = formatWhatsAppSummary(cuadre, false);

    expect(summary).toContain('RD$ 50,000.00');
    expect(summary).toContain('RD$ 15,000.00');
  });
});
