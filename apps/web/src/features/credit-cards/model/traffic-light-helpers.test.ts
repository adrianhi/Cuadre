import { describe, expect, it } from 'vitest';
import {
  ANTI_FINANCING_INFO,
  formatShortDate,
  getTrafficLightMeta,
} from './traffic-light-helpers';

describe('traffic-light-helpers', () => {
  it('returns EXCELLENT meta with green badge styling', () => {
    const meta = getTrafficLightMeta('EXCELLENT');
    expect(meta.label).toContain('RECOMENDADA HOY');
    expect(meta.badgeClass).toContain('emerald');
  });

  it('returns GOOD meta with amber badge styling', () => {
    const meta = getTrafficLightMeta('GOOD');
    expect(meta.label).toContain('NEUTRA');
    expect(meta.badgeClass).toContain('amber');
  });

  it('returns AVOID_CUT_IMMINENT meta with destructive badge styling', () => {
    const meta = getTrafficLightMeta('AVOID_CUT_IMMINENT');
    expect(meta.label).toContain('NO USAR HOY');
    expect(meta.badgeClass).toContain('destructive');
  });

  it('formats dates cleanly', () => {
    expect(formatShortDate(null)).toBe('-');
    expect(formatShortDate(undefined)).toBe('-');
    const formatted = formatShortDate('2026-10-25T00:00:00.000Z');
    expect(formatted).toBeTruthy();
    expect(formatted).not.toBe('-');
  });

  it('contains valid anti-financing educational info', () => {
    expect(ANTI_FINANCING_INFO.statRate).toContain('50% - 60%');
    expect(ANTI_FINANCING_INFO.message).toContain('TOTAL');
  });
});
