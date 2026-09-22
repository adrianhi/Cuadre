import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuickActionRail } from './QuickActionRail';

vi.mock('@/features/credit-cards', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/credit-cards')>();
  return {
    ...actual,
    useCreditCardsSummary: () => ({
      data: null,
      isLoading: false,
    }),
  };
});

describe('QuickActionRail', () => {
  it('renders all four quick actions with mobile rail and desktop grid classes', () => {
    const html = renderToStaticMarkup(
      <QuickActionRail
        onOpenTrafficLight={vi.fn()}
        onOpenCoro={vi.fn()}
        onOpenWrapped={vi.fn()}
        onOpenSimulator={vi.fn()}
      />
    );

    // Actions present
    expect(html).toContain('Con cuál pago');
    expect(html).toContain('Modo Coro');
    expect(html).toContain('Cuadre del Mes');
    expect(html).toContain('Simular gasto');

    // Subtitles
    expect(html).toContain('Semáforo de tarjetas');
    expect(html).toContain('Cuentas compartidas');
    expect(html).toContain('Tu resumen Wrapped');
    expect(html).toContain('Prueba tu margen');

    // Responsive desktop grid classes
    expect(html).toContain('xl:grid');
    expect(html).toContain('xl:grid-cols-4');
    expect(html).toContain('xl:gap-3');
    expect(html).toContain('xl:overflow-visible');

    // Mobile scroll rail classes
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('snap-x');
  });
});
