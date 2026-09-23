import { describe, expect, it } from 'vitest';
import { computeNextExpectedDate } from './useManageRecurring';

describe('useManageRecurring - computeNextExpectedDate', () => {
  it('computes the same day next month correctly for standard dates', () => {
    expect(computeNextExpectedDate('2026-08-15')).toBe('2026-09-15');
    expect(computeNextExpectedDate('2026-04-10T12:00:00Z')).toBe('2026-05-10');
  });

  it('clamps to the last day of next month when day overflows (e.g. Jan 31 -> Feb 28)', () => {
    // 2026 is not a leap year, so February has 28 days
    expect(computeNextExpectedDate('2026-01-31')).toBe('2026-02-28');
    // March 31 -> April 30
    expect(computeNextExpectedDate('2026-03-31')).toBe('2026-04-30');
    // August 31 -> September 30
    expect(computeNextExpectedDate('2026-08-31')).toBe('2026-09-30');
  });

  it('handles December to January year rollover', () => {
    expect(computeNextExpectedDate('2026-12-15')).toBe('2027-01-15');
  });

  it('falls back gracefully on invalid dates without throwing', () => {
    const fallback = computeNextExpectedDate('invalid-date');
    expect(fallback).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
