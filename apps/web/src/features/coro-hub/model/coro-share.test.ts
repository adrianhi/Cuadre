import { describe, expect, it } from 'vitest';
import type { CoroTransferSuggestion } from '@bills/contracts';
import { buildCoroWhatsAppShareUrl, buildSettlementsWhatsAppText } from './coro-share';

describe('coro-share utilities', () => {
  it('builds a Dominican-style WhatsApp share URL with public slug', () => {
    const url = buildCoroWhatsAppShareUrl('Viaje a Las Terrenas', 15000, 'DOP', 5, 'viaje-terrenas-123');
    expect(url).toContain('https://wa.me/?text=');
    const decoded = decodeURIComponent(url.replace('https://wa.me/?text=', ''));
    expect(decoded).toContain('🌴 *Viaje a Las Terrenas*');
    expect(decoded).toContain('15,000');
    expect(decoded).toContain('5 personas');
    expect(decoded).toContain('/coro/viaje-terrenas-123');
  });

  it('formats settlements into a clean WhatsApp text summary for chat', () => {
    const settlements: CoroTransferSuggestion[] = [
      {
        id: 's-1',
        fromId: 'p-1',
        fromName: 'Carlos',
        toId: 'p-2',
        toName: 'Laura',
        amount: 2500.5,
        status: 'PENDING',
        canMarkPaid: true,
        canConfirm: false,
      },
      {
        id: 's-2',
        fromId: 'p-3',
        fromName: 'Pedro',
        toId: 'p-2',
        toName: 'Laura',
        amount: 1200,
        status: 'MARKED_PAID',
        canMarkPaid: false,
        canConfirm: true,
      },
    ];

    const text = buildSettlementsWhatsAppText('Cena de Cumpleaños', 7000, 'DOP', settlements);
    expect(text).toContain('💰 *CUADRE FINAL - Cena de Cumpleaños*');
    expect(text).toContain('👉 Carlos le debe a Laura:');
    expect(text).toContain('⏳ (Reportado pagado) Pedro le debe a Laura:');
    expect(text).toContain('¡Cuentas claras conservan amistades!');
  });

  it('handles empty or fully settled debts gracefully', () => {
    const text = buildSettlementsWhatsAppText('Coro Cuadrado', 5000, 'DOP', []);
    expect(text).toContain('¡Todo el mundo está al día! No hay pagos pendientes.');
  });
});
