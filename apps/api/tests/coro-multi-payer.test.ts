import { describe, expect, it } from 'vitest';
import {
  calculateBalances,
  parseWhatsAppParticipantsList,
  simplifyBalances,
  type CoroExpenseValue,
} from '../src/modules/coro';

describe('Modo Coro - Múltiples Pagadores & Parser WhatsApp', () => {
  it('calcula balances correctamente cuando un gasto es pagado por dos personas', () => {
    // Escenario: Cena de RD$ 10,000 dividida en partes iguales entre 5 amigos ($2,000 c/u)
    // Adrian pagó RD$ 6,000
    // Carlos pagó RD$ 4,000
    // Participantes: P1 (Adrian), P2 (Carlos), P3 (Pamela), P4 (Jean), P5 (Laura)
    const participants = ['p1', 'p2', 'p3', 'p4', 'p5'];
    const expenses: CoroExpenseValue[] = [
      {
        id: 'e1',
        title: 'Cena en restaurante',
        amountCents: 1000000, // 10,000.00
        currency: 'DOP',
        expenseDate: new Date(),
        payers: [
          { participantId: 'p1', amountCents: 600000 }, // 6,000.00
          { participantId: 'p2', amountCents: 400000 }, // 4,000.00
        ],
        splits: [
          { participantId: 'p1', amountCents: 200000 },
          { participantId: 'p2', amountCents: 200000 },
          { participantId: 'p3', amountCents: 200000 },
          { participantId: 'p4', amountCents: 200000 },
          { participantId: 'p5', amountCents: 200000 },
        ],
      },
    ];

    const balances = calculateBalances(participants, expenses);
    const byId = Object.fromEntries(balances.map((b) => [b.participantId, b]));

    // Adrian puso 6,000, debe 2,000 => neto +4,000
    expect(byId.p1.paidCents).toBe(600000);
    expect(byId.p1.owedCents).toBe(200000);
    expect(byId.p1.netCents).toBe(400000);

    // Carlos puso 4,000, debe 2,000 => neto +2,000
    expect(byId.p2.paidCents).toBe(400000);
    expect(byId.p2.owedCents).toBe(200000);
    expect(byId.p2.netCents).toBe(200000);

    // Los demás pusieron 0, deben 2,000 => neto -2,000
    expect(byId.p3.netCents).toBe(-200000);
    expect(byId.p4.netCents).toBe(-200000);
    expect(byId.p5.netCents).toBe(-200000);

    // Simplificación de transferencias
    const transfers = simplifyBalances(balances);
    const totalTransferred = transfers.reduce((acc, t) => acc + t.amountCents, 0);
    expect(totalTransferred).toBe(600000); // 4,000 + 2,000
    // Solo deben pagarle a p1 y p2
    for (const t of transfers) {
      expect(['p1', 'p2']).toContain(t.toId);
      expect(['p3', 'p4', 'p5']).toContain(t.fromId);
    }
  });

  it('extrae participantes de texto típico de WhatsApp con diversos formatos', () => {
    const rawWhatsAppText = `
      🌴 Coro Las Terrenas Confirmados:
      1. Adrian Hidalgo
      2) Carlos Perez
      3 - Laura Gómez
      * Pamela Reyes
      • Jean Castillo
      - Marcos Santana
      Adrian Hidalgo
    `;

    const parsed = parseWhatsAppParticipantsList(rawWhatsAppText);

    expect(parsed).toEqual([
      'Adrian Hidalgo',
      'Carlos Perez',
      'Laura Gómez',
      'Pamela Reyes',
      'Jean Castillo',
      'Marcos Santana',
    ]);
  });

  it('ignora líneas vacías y encabezados cortos con dos puntos', () => {
    const text = `
      Lista de la cena:
      Adrian
      Pedro

      Laura:
    `;
    const parsed = parseWhatsAppParticipantsList(text);
    expect(parsed).toEqual(['Adrian', 'Pedro']);
  });
});
