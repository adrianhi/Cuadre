const BANK_CONFIG: Record<string, { badge: string; abbr: string }> = {
  BHD: { badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30', abbr: 'BHD' },
  RESERVAS: { badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30', abbr: 'BR' },
  POPULAR: { badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30', abbr: 'BPD' },
  QIK: { badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30', abbr: 'QIK' },
};

export function bankMeta(code: string) {
  const upper = code.toUpperCase();
  const match = Object.keys(BANK_CONFIG).find((k) => upper.includes(k));
  return match ? BANK_CONFIG[match] : { badge: 'bg-muted text-muted-foreground border border-border', abbr: code.slice(0, 3).toUpperCase() };
}
