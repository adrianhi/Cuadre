export interface BankTheme {
  code: string;
  name: string;
  shortName: string;
  badgeClass: string;
  cardGradient: string;
  borderClass: string;
  accentText: string;
  dotClass: string;
  chipBg: string;
}

export const BANK_THEMES: Record<string, BankTheme> = {
  POPULAR: {
    code: 'POPULAR',
    name: 'Banco Popular',
    shortName: 'Popular',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    cardGradient: 'from-sky-500/15 via-blue-500/5 to-card',
    borderClass: 'border-sky-500/30',
    accentText: 'text-sky-600 dark:text-sky-400',
    dotClass: 'bg-sky-500',
    chipBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  BHD: {
    code: 'BHD',
    name: 'Banco BHD',
    shortName: 'BHD',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    cardGradient: 'from-emerald-500/15 via-teal-500/5 to-card',
    borderClass: 'border-emerald-500/30',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    chipBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  BANRESERVAS: {
    code: 'BANRESERVAS',
    name: 'Banreservas',
    shortName: 'Reservas',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    cardGradient: 'from-blue-500/15 via-indigo-500/5 to-card',
    borderClass: 'border-blue-500/30',
    accentText: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
    chipBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  QIK: {
    code: 'QIK',
    name: 'Qik Banco Digital',
    shortName: 'Qik',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    cardGradient: 'from-cyan-500/15 via-teal-500/5 to-card',
    borderClass: 'border-cyan-500/30',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    dotClass: 'bg-cyan-500',
    chipBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  },
  OTHER: {
    code: 'OTHER',
    name: 'Otra Institución',
    shortName: 'Otro',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    cardGradient: 'from-muted/40 via-muted/10 to-card',
    borderClass: 'border-border',
    accentText: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    chipBg: 'bg-muted text-muted-foreground',
  },
};

export const SUPPORTED_BANKS = [
  { code: 'POPULAR', name: 'Banco Popular' },
  { code: 'BHD', name: 'Banco BHD' },
  { code: 'BANRESERVAS', name: 'Banreservas' },
  { code: 'QIK', name: 'Qik Banco Digital' },
  { code: 'OTHER', name: 'Otra Institución' },
] as const;

export function getBankTheme(institutionCode?: string | null): BankTheme {
  const code = (institutionCode || '').toUpperCase().trim();
  if (code.includes('POPULAR') || code.includes('BPD')) return BANK_THEMES.POPULAR;
  if (code.includes('BHD')) return BANK_THEMES.BHD;
  if (code.includes('BANRESERVAS') || code.includes('RESERVAS')) return BANK_THEMES.BANRESERVAS;
  if (code.includes('QIK')) return BANK_THEMES.QIK;
  return BANK_THEMES[code] ?? BANK_THEMES.OTHER;
}

export function formatCardLast4(cardLast4?: string | null): string {
  if (!cardLast4) return '•••• ----';
  return `•••• ${cardLast4}`;
}
