import { describe, expect, it } from 'vitest';
import {
  BANK_THEMES,
  formatCardLast4,
  getBankTheme,
} from './bank-theme';

describe('bank-theme', () => {
  it('returns POPULAR theme for POPULAR institution code or variants', () => {
    expect(getBankTheme('POPULAR')).toBe(BANK_THEMES.POPULAR);
    expect(getBankTheme('bpd')).toBe(BANK_THEMES.POPULAR);
    expect(getBankTheme('Banco Popular Dominicano')).toBe(BANK_THEMES.POPULAR);
  });

  it('returns BHD theme for BHD institution code', () => {
    expect(getBankTheme('BHD')).toBe(BANK_THEMES.BHD);
    expect(getBankTheme('bhd_leon')).toBe(BANK_THEMES.BHD);
  });

  it('returns BANRESERVAS theme for BANRESERVAS institution code', () => {
    expect(getBankTheme('BANRESERVAS')).toBe(BANK_THEMES.BANRESERVAS);
    expect(getBankTheme('reservas')).toBe(BANK_THEMES.BANRESERVAS);
  });

  it('returns QIK theme for QIK institution code', () => {
    expect(getBankTheme('QIK')).toBe(BANK_THEMES.QIK);
    expect(getBankTheme('qik')).toBe(BANK_THEMES.QIK);
  });

  it('falls back to OTHER theme for unrecognized codes', () => {
    expect(getBankTheme('UNKNOWN')).toBe(BANK_THEMES.OTHER);
    expect(getBankTheme(null)).toBe(BANK_THEMES.OTHER);
    expect(getBankTheme(undefined)).toBe(BANK_THEMES.OTHER);
  });

  it('formats last 4 digits properly', () => {
    expect(formatCardLast4('1234')).toBe('•••• 1234');
    expect(formatCardLast4(null)).toBe('•••• ----');
    expect(formatCardLast4(undefined)).toBe('•••• ----');
  });
});
