import { describe, expect, it } from 'vitest';
import {
  isPotentialSelfTransfer,
  matchesWorkspaceOwner,
  normalizedNameTokens,
} from '../src/modules/transactions/domain/self-transfer-matcher';

describe('self-transfer name matcher', () => {
  it('normalizes accents, punctuation, honorifics and connectors', () => {
    expect(normalizedNameTokens('Sr. Adrián de la Hídalgo-Beltré')).toEqual(['adrian', 'hidalgo', 'beltre']);
  });

  it('requires at least two meaningful matching owner tokens', () => {
    expect(matchesWorkspaceOwner('ADRIAN JOEL HIDALGO', ['Adrián Hidalgo'])).toBe(true);
    expect(matchesWorkspaceOwner('TRANSFERENCIA A ADRIAN', ['Adrián Hidalgo'])).toBe(false);
    expect(matchesWorkspaceOwner('ADRIAN HIDALGO', ['María Pérez'])).toBe(false);
  });

  it('only suggests a match for structurally identified transfers', () => {
    const owner = ['Adrián Hidalgo'];
    expect(isPotentialSelfTransfer({ transactionType: 'Transferencia enviada', merchant: 'Adrian Hidalgo' }, owner)).toBe(true);
    expect(isPotentialSelfTransfer({ transactionType: 'Compra', merchant: 'Adrian Hidalgo' }, owner)).toBe(false);
  });
});
