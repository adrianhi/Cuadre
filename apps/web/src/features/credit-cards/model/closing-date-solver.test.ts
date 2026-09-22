import { describe, expect, it } from 'vitest';
import {
  deduceClosingDayFromDueDay,
  getBankCommonCuts,
  getBankDefaultGraceDays,
  normalizeInstitutionCode,
} from './closing-date-solver';

describe('closing-date-solver', () => {
  describe('Bank configuration and defaults', () => {
    it('returns correct default grace days for Dominican banks', () => {
      expect(getBankDefaultGraceDays('POPULAR')).toBe(22);
      expect(getBankDefaultGraceDays('Banco Popular')).toBe(22);
      expect(getBankDefaultGraceDays('BHD')).toBe(22);
      expect(getBankDefaultGraceDays('Banco BHD')).toBe(22);
      expect(getBankDefaultGraceDays('BANRESERVAS')).toBe(21);
      expect(getBankDefaultGraceDays('Banreservas')).toBe(21);
      expect(getBankDefaultGraceDays('QIK')).toBe(22);
      expect(getBankDefaultGraceDays('OTHER')).toBe(22);
      expect(getBankDefaultGraceDays('UNKNOWN_BANK')).toBe(22);
    });

    it('returns official common cuts for Dominican banks', () => {
      expect(getBankCommonCuts('POPULAR')).toEqual([2, 7, 12, 17, 22, 27]);
      expect(getBankCommonCuts('BHD')).toEqual([4, 9, 14, 18, 24, 28]);
      expect(getBankCommonCuts('BANRESERVAS')).toEqual([5, 10, 15, 20, 25, 30]);
      expect(getBankCommonCuts('QIK')).toEqual([15, 24, 30]);
      expect(getBankCommonCuts('OTHER')).toEqual([]);
    });

    it('normalizes institution codes gracefully', () => {
      expect(normalizeInstitutionCode('popular')).toBe('POPULAR');
      expect(normalizeInstitutionCode('BPD')).toBe('POPULAR');
      expect(normalizeInstitutionCode('bhd leon')).toBe('BHD');
      expect(normalizeInstitutionCode('reservas')).toBe('BANRESERVAS');
      expect(normalizeInstitutionCode('qik')).toBe('QIK');
      expect(normalizeInstitutionCode('')).toBe('OTHER');
      expect(normalizeInstitutionCode(null)).toBe('OTHER');
    });
  });

  describe('deduceClosingDayFromDueDay - Real Dominican banking cases', () => {
    it('deduces cut 18 when paying on the 10th in BHD (grace = 22)', () => {
      const result = deduceClosingDayFromDueDay(10, 'BHD');
      expect(result.graceDaysUsed).toBe(22);
      expect(result.matchedOfficialCut).toBe(18);
      expect(result.calculatedClosingDay).toBe(18);
      expect(result.explanation).toContain('corte oficial del día 18');
    });

    it('deduces cut 17 when paying on the 9th in Popular (grace = 22)', () => {
      const result = deduceClosingDayFromDueDay(9, 'POPULAR');
      expect(result.graceDaysUsed).toBe(22);
      expect(result.matchedOfficialCut).toBe(17);
      expect(result.calculatedClosingDay).toBe(17);
      expect(result.explanation).toContain('corte oficial del día 17');
    });

    it('deduces cut 4 when paying on the 26th in BHD (grace = 22)', () => {
      const result = deduceClosingDayFromDueDay(26, 'BHD');
      expect(result.graceDaysUsed).toBe(22);
      expect(result.matchedOfficialCut).toBe(4);
      expect(result.calculatedClosingDay).toBe(4);
      expect(result.explanation).toContain('corte oficial del día 4');
    });

    it('deduces cut 25 when paying on the 15th (quincena) in Banreservas (grace = 21)', () => {
      const result = deduceClosingDayFromDueDay(15, 'BANRESERVAS');
      expect(result.graceDaysUsed).toBe(21);
      // 15 - 21 = -6 -> 30 - 6 = 24, 31 - 6 = 25 (exact match in Banreservas [5, 10, 15, 20, 25, 30])
      expect(result.matchedOfficialCut).toBe(25);
      expect(result.explanation).toContain('corte oficial del día 25');
    });

    it('deduces cut 22 when paying on the 15th (quincena) in Popular (grace = 22)', () => {
      const result = deduceClosingDayFromDueDay(15, 'POPULAR');
      expect(result.graceDaysUsed).toBe(22);
      // 15 - 22 = -7 -> 30 - 7 = 23 (closest official cut in Popular [2, 7, 12, 17, 22, 27] is 22, dist = 1)
      expect(result.matchedOfficialCut).toBe(22);
      expect(result.calculatedClosingDay).toBe(23);
      expect(result.explanation).toContain('corte oficial más cercano del día 22');
    });

    it('deduces cut 24 when paying on the 15th in BHD (grace = 22)', () => {
      const result = deduceClosingDayFromDueDay(15, 'BHD');
      expect(result.graceDaysUsed).toBe(22);
      // 31 - 7 = 24 (exact match in BHD cuts)
      expect(result.matchedOfficialCut).toBe(24);
      expect(result.calculatedClosingDay).toBe(24);
    });

    it('handles custom grace days override', () => {
      // If user specifies 20 days grace for Popular and pays on day 10:
      // 10 - 20 = -10 -> 30 - 10 = 20.
      const result = deduceClosingDayFromDueDay(10, 'POPULAR', 20);
      expect(result.graceDaysUsed).toBe(20);
      expect(result.calculatedClosingDay).toBe(20);
    });

    it('falls back gracefully when bank has no official cuts (OTHER)', () => {
      const result = deduceClosingDayFromDueDay(10, 'OTHER');
      expect(result.graceDaysUsed).toBe(22);
      expect(result.calculatedClosingDay).toBe(18);
      expect(result.matchedOfficialCut).toBeNull();
      expect(result.explanation).toContain('corte estimado es el día 18');
    });
  });

  describe('Boundary and limit testing (Days 1 to 31)', () => {
    it('clamps values below 1 to day 1', () => {
      const result = deduceClosingDayFromDueDay(0, 'BHD');
      // day 1 with grace 22: 1 - 22 = -21 -> 30 - 21 = 9 (matches BHD cut 9)
      expect(result.matchedOfficialCut).toBe(9);
    });

    it('clamps values above 31 to day 31', () => {
      const result = deduceClosingDayFromDueDay(40, 'BHD');
      // day 31 with grace 22: 31 - 22 = 9 (matches BHD cut 9)
      expect(result.matchedOfficialCut).toBe(9);
    });

    it('evaluates all days from 1 to 31 without throwing and always produces valid days', () => {
      const banks = ['POPULAR', 'BHD', 'BANRESERVAS', 'QIK', 'OTHER'];
      for (const bank of banks) {
        for (let day = 1; day <= 31; day++) {
          const result = deduceClosingDayFromDueDay(day, bank);
          expect(result.calculatedClosingDay).toBeGreaterThanOrEqual(1);
          expect(result.calculatedClosingDay).toBeLessThanOrEqual(31);
          if (result.matchedOfficialCut !== null) {
            expect(result.matchedOfficialCut).toBeGreaterThanOrEqual(1);
            expect(result.matchedOfficialCut).toBeLessThanOrEqual(31);
          }
          expect(result.explanation.length).toBeGreaterThan(10);
        }
      }
    });
  });
});
