export interface DeducedClosingDayResult {
  calculatedClosingDay: number;
  matchedOfficialCut: number | null;
  graceDaysUsed: number;
  explanation: string;
}

export const DEFAULT_GRACE_DAYS: Record<string, number> = {
  POPULAR: 22,
  BHD: 22,
  BANRESERVAS: 21,
  QIK: 22,
  OTHER: 22,
};

export const COMMON_BANK_CUTS: Record<string, number[]> = {
  POPULAR: [2, 7, 12, 17, 22, 27],
  BHD: [4, 9, 14, 18, 24, 28],
  BANRESERVAS: [5, 10, 15, 20, 25, 30],
  QIK: [15, 24, 30],
  OTHER: [],
};

export const DOMINICAN_DUE_CHIPS = [
  { day: 5, label: 'Día 5' },
  { day: 10, label: 'Día 10' },
  { day: 15, label: 'Día 15 (Quincena)' },
  { day: 20, label: 'Día 20' },
  { day: 25, label: 'Día 25' },
  { day: 30, label: 'Día 30' },
] as const;

const BANK_FRIENDLY_NAMES: Record<string, string> = {
  POPULAR: 'Banco Popular',
  BHD: 'Banco BHD',
  BANRESERVAS: 'Banreservas',
  QIK: 'Qik Banco Digital',
  OTHER: 'tu banco',
};

export function normalizeInstitutionCode(institutionCode?: string | null): string {
  const code = (institutionCode || '').toUpperCase().trim();
  if (code.includes('POPULAR') || code.includes('BPD')) return 'POPULAR';
  if (code.includes('BHD')) return 'BHD';
  if (code.includes('BANRESERVAS') || code.includes('RESERVAS')) return 'BANRESERVAS';
  if (code.includes('QIK')) return 'QIK';
  return 'OTHER';
}

export function getBankDefaultGraceDays(institutionCode: string): number {
  const normalized = normalizeInstitutionCode(institutionCode);
  return DEFAULT_GRACE_DAYS[normalized] ?? 22;
}

export function getBankCommonCuts(institutionCode: string): number[] {
  const normalized = normalizeInstitutionCode(institutionCode);
  return COMMON_BANK_CUTS[normalized] ?? [];
}

/**
 * Deduces the statement closing day from the payment due day.
 * Reverse formula: Closing Day ≈ Due Day - Grace Days (wrapped across month boundaries).
 * If the resulting day is within ±1 day of a known official Dominican bank cut,
 * that official cut is suggested.
 */
export function deduceClosingDayFromDueDay(
  dueDay: number,
  institutionCode: string,
  customGraceDays?: number
): DeducedClosingDayResult {
  const safeDueDay = Math.min(31, Math.max(1, Math.round(dueDay)));
  const normalizedCode = normalizeInstitutionCode(institutionCode);
  const bankName = BANK_FRIENDLY_NAMES[normalizedCode] ?? 'tu banco';

  const graceDaysUsed =
    typeof customGraceDays === 'number' && !Number.isNaN(customGraceDays) && customGraceDays >= 0
      ? customGraceDays
      : getBankDefaultGraceDays(institutionCode);

  // Raw math reversion: Due Day - Grace Days
  let rawDay = safeDueDay - graceDaysUsed;
  const candidateDays: number[] = [];

  if (rawDay > 0) {
    candidateDays.push(rawDay);
  } else {
    // Crosses month boundary: consider 30-day and 31-day month bases
    const dayIn30Month = 30 + rawDay;
    const dayIn31Month = 31 + rawDay;
    if (dayIn30Month >= 1 && dayIn30Month <= 31) candidateDays.push(dayIn30Month);
    if (dayIn31Month >= 1 && dayIn31Month <= 31 && !candidateDays.includes(dayIn31Month)) {
      candidateDays.push(dayIn31Month);
    }
  }

  const baseCalculatedDay = candidateDays[0] ?? Math.max(1, Math.min(31, (rawDay % 30) + 30));

  const officialCuts = getBankCommonCuts(institutionCode);
  let matchedOfficialCut: number | null = null;

  // 1. Check exact match with official cuts
  for (const candidate of candidateDays) {
    if (officialCuts.includes(candidate)) {
      matchedOfficialCut = candidate;
      break;
    }
  }

  // 2. If no exact match, check for close cut (±1 day)
  if (matchedOfficialCut === null && officialCuts.length > 0) {
    let bestCut: number | null = null;
    let minDistance = 2; // only consider distance <= 1

    for (const cut of officialCuts) {
      for (const candidate of candidateDays) {
        const dist = Math.abs(cut - candidate);
        if (dist <= 1 && dist < minDistance) {
          minDistance = dist;
          bestCut = cut;
        }
      }
    }

    if (bestCut !== null) {
      matchedOfficialCut = bestCut;
    }
  }

  // Determine calculated day: prefer exact candidate if matched, or base candidate
  const calculatedClosingDay = candidateDays.includes(matchedOfficialCut ?? -1)
    ? (matchedOfficialCut as number)
    : baseCalculatedDay;

  // Build user-friendly Dominican fintech explanation
  let explanation: string;
  if (matchedOfficialCut !== null) {
    if (matchedOfficialCut === calculatedClosingDay) {
      explanation = `Para ${bankName}, pagar el día ${safeDueDay} coincide exactamente con el corte oficial del día ${matchedOfficialCut} (${graceDaysUsed} días de gracia).`;
    } else {
      explanation = `El cálculo da día ${calculatedClosingDay}, que corresponde al corte oficial más cercano del día ${matchedOfficialCut} en ${bankName} (${graceDaysUsed} días de gracia).`;
    }
  } else {
    explanation = `Según los ${graceDaysUsed} días de gracia estándar, tu corte estimado es el día ${calculatedClosingDay}.`;
  }

  return {
    calculatedClosingDay,
    matchedOfficialCut,
    graceDaysUsed,
    explanation,
  };
}
