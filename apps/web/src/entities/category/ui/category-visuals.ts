import type { CategoryColorKey } from '@bills/contracts';

export const CATEGORY_COLOR_OPTIONS: Array<{ key: CategoryColorKey; label: string; dot: string }> = [
  { key: 'emerald', label: 'Esmeralda', dot: 'bg-emerald-500' },
  { key: 'blue', label: 'Azul', dot: 'bg-blue-500' },
  { key: 'amber', label: 'Ámbar', dot: 'bg-amber-500' },
  { key: 'violet', label: 'Violeta', dot: 'bg-violet-500' },
  { key: 'pink', label: 'Rosa', dot: 'bg-pink-500' },
  { key: 'cyan', label: 'Cian', dot: 'bg-cyan-500' },
  { key: 'slate', label: 'Gris', dot: 'bg-slate-500' },
  { key: 'red', label: 'Rojo', dot: 'bg-red-500' },
];

export const categoryDotClass = (key: CategoryColorKey) =>
  CATEGORY_COLOR_OPTIONS.find((item) => item.key === key)?.dot ?? 'bg-slate-500';

const HEX_COLORS: Record<CategoryColorKey, string> = {
  emerald: '#10b981', blue: '#3b82f6', amber: '#f59e0b', violet: '#8b5cf6',
  pink: '#ec4899', cyan: '#06b6d4', slate: '#64748b', red: '#ef4444',
};
export const categoryHexColor = (key: CategoryColorKey) => HEX_COLORS[key];
