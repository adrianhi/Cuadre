import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  claimCoroParticipantInputSchema, coroPaymentDestinationSchema, createCoroExpenseInputSchema,
} from '@bills/contracts';
import { calculateBalances, isPotentialDuplicate, simplifyBalances, splitAmountCents } from '../src/modules/coro';

describe('Modo Coro', () => {
  it('reparte centavos sin perder dinero y con orden estable', () => {
    expect(splitAmountCents(10_000, ['c', 'a', 'b'])).toEqual([
      { participantId: 'a', amountCents: 3334 },
      { participantId: 'b', amountCents: 3333 },
      { participantId: 'c', amountCents: 3333 },
    ]);
  });

  it('reduce el caso 6000/3000/0 a una transferencia', () => {
    const balances = calculateBalances(['a', 'b', 'c'], [
      { id: '1', title: 'Casa', amountCents: 600_000, currency: 'DOP', expenseDate: new Date(), paidById: 'a', splits: splitAmountCents(600_000, ['a', 'b', 'c']) },
      { id: '2', title: 'Cena', amountCents: 300_000, currency: 'DOP', expenseDate: new Date(), paidById: 'b', splits: splitAmountCents(300_000, ['a', 'b', 'c']) },
    ]);
    expect(simplifyBalances(balances)).toEqual([{ fromId: 'c', toId: 'a', amountCents: 300_000 }]);
  });

  it('produce como máximo N-1 transferencias sin ciclos', () => {
    const result = simplifyBalances([
      { participantId: 'a', netCents: 900 }, { participantId: 'b', netCents: 100 },
      { participantId: 'c', netCents: -400 }, { participantId: 'd', netCents: -600 },
    ]);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.reduce((sum, item) => sum + item.amountCents, 0)).toBe(1_000);
  });

  it('detecta duplicados solo dentro de tolerancia y ventana', () => {
    const base = { title: 'Cena en Adrian Tropical', amountCents: 10_000, currency: 'DOP', expenseDate: new Date('2026-09-01T12:00:00Z') };
    expect(isPotentialDuplicate(base, { ...base, title: 'Adrian Tropical cena', amountCents: 10_499 })).toBe(true);
    expect(isPotentialDuplicate(base, { ...base, amountCents: 11_000 })).toBe(false);
    expect(isPotentialDuplicate(base, { ...base, expenseDate: new Date('2026-09-03T12:00:00Z') })).toBe(false);
  });

  it('valida moneda, precisión, identidad y destinos de pago', () => {
    expect(createCoroExpenseInputSchema.safeParse({ title: 'Cena', amount: 100.123, paidById: randomUUID(), expenseDate: new Date().toISOString(), splitParticipantIds: [randomUUID()] }).success).toBe(false);
    expect(claimCoroParticipantInputSchema.safeParse({ name: 'Ana' }).success).toBe(true);
    expect(coroPaymentDestinationSchema.safeParse({ kind: 'BANK', bankCode: 'POPULAR', accountType: 'SAVINGS', accountNumber: '12345678', accountHolder: 'Ana Pérez' }).success).toBe(true);
    expect(coroPaymentDestinationSchema.safeParse({ kind: 'QIK', phoneNumber: '8095551234', accountHolder: 'Ana Pérez' }).success).toBe(true);
  });
});
