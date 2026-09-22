import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafeToSpendDial } from './SafeToSpendDial';
import type { SafeToSpendDto } from '@/entities/budget';

describe('SafeToSpendDial', () => {
  it('renders loading skeleton when loading is true', () => {
    const html = renderToStaticMarkup(
      <SafeToSpendDial
        value={null}
        loading={true}
        hideBalances={false}
        onManageBudget={vi.fn()}
      />
    );

    expect(html).toContain('animate-pulse');
    expect(html).toContain('data-product-tour="safe-to-spend"');
  });

  it('renders balanced horizontal UNSET layout when budget is not configured', () => {
    const html = renderToStaticMarkup(
      <SafeToSpendDial
        value={null}
        loading={false}
        hideBalances={false}
        onManageBudget={vi.fn()}
      />
    );

    expect(html).toContain('Activa tu Margen Seguro Diario');
    expect(html).toContain('Define un presupuesto global para activar tu monto diario.');
    expect(html).toContain('Definir límite mensual');
    // Horizontal layout classes on large screens
    expect(html).toContain('lg:flex-row');
    expect(html).toContain('lg:items-center');
    expect(html).toContain('lg:justify-between');
  });

  it('renders active dial with balanced horizontal split on desktop', () => {
    const activeValue: SafeToSpendDto = {
      date: '2026-09-21',
      month: '2026-09',
      currency: 'DOP',
      status: 'SURPLUS',
      reason: 'NONE',
      globalLimit: 60000,
      spentBeforeToday: 35000,
      spentToday: 500,
      todayAvailable: 1500,
      todayOverage: 0,
      dailyAllowance: 2000,
      daysRemaining: 9,
      futureConfirmedCommitments: 500,
      nextDailyAllowance: 0,
    };

    const html = renderToStaticMarkup(
      <SafeToSpendDial
        value={activeValue}
        loading={false}
        hideBalances={false}
        onManageBudget={vi.fn()}
      />
    );

    expect(html).toContain('Margen Seguro Diario');
    expect(html).toContain('9 días restantes');
    expect(html).toContain('Vas bien. Este es tu margen para hoy.');
    expect(html).toContain('Administrar presupuesto');
    expect(html).toContain('reservados para cobros próximos');
    // Horizontal split classes
    expect(html).toContain('lg:flex-row');
    expect(html).toContain('lg:items-center');
    expect(html).toContain('lg:gap-8');
  });

  it('renders adjusting status with tomorrow allowance note', () => {
    const adjustingValue: SafeToSpendDto = {
      date: '2026-09-21',
      month: '2026-09',
      currency: 'USD',
      status: 'ADJUSTING',
      reason: 'OVER_DAILY_ALLOWANCE',
      globalLimit: 1500,
      spentBeforeToday: 1100,
      spentToday: 75,
      todayAvailable: 25,
      todayOverage: 0,
      dailyAllowance: 50,
      daysRemaining: 12,
      futureConfirmedCommitments: 0,
      nextDailyAllowance: 30,
    };

    const html = renderToStaticMarkup(
      <SafeToSpendDial
        value={adjustingValue}
        loading={false}
        hideBalances={false}
        onManageBudget={vi.fn()}
      />
    );

    expect(html).toContain('Tu plan se ajusta sin juicios para los días que quedan.');
    expect(html).toContain('Mañana:');
    expect(html).toContain('por día.');
    expect(html).toContain('Administrar presupuesto');
  });

  it('masks balances when hideBalances is true', () => {
    const activeValue: SafeToSpendDto = {
      date: '2026-09-21',
      month: '2026-09',
      currency: 'DOP',
      status: 'SURPLUS',
      reason: 'NONE',
      globalLimit: 60000,
      spentBeforeToday: 35000,
      spentToday: 500,
      todayAvailable: 1500,
      todayOverage: 0,
      dailyAllowance: 2000,
      daysRemaining: 9,
      futureConfirmedCommitments: 500,
      nextDailyAllowance: 0,
    };

    const html = renderToStaticMarkup(
      <SafeToSpendDial
        value={activeValue}
        loading={false}
        hideBalances={true}
        onManageBudget={vi.fn()}
      />
    );

    expect(html).toContain('••••••');
    expect(html).toContain('Reservas próximas incluidas');
  });
});
