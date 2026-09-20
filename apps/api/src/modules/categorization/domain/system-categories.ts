import {
  COMMON_TRANSACTION_CATEGORIES,
  type CategoryCatalogItem,
  type CategoryColorKey,
} from '@bills/contracts';
import { normalizeLabel } from '../../../shared/domain/normalize-label';

const VISUALS: Record<string, { colorKey: CategoryColorKey; icon: string }> = {
  supermercado: { colorKey: 'emerald', icon: '🛒' },
  'restaurantes & delivery': { colorKey: 'amber', icon: '🍽️' },
  'servicios financieros': { colorKey: 'blue', icon: '🏦' },
  transferencias: { colorKey: 'blue', icon: '↗️' },
  transporte: { colorKey: 'violet', icon: '🚕' },
  combustible: { colorKey: 'amber', icon: '⛽' },
  servicios: { colorKey: 'cyan', icon: '💡' },
  suscripciones: { colorKey: 'cyan', icon: '🔁' },
  'salud & farmacia': { colorKey: 'red', icon: '💊' },
  'compras online': { colorKey: 'pink', icon: '📦' },
  hogar: { colorKey: 'emerald', icon: '🏠' },
  'ropa & moda': { colorKey: 'pink', icon: '👕' },
  entretenimiento: { colorKey: 'violet', icon: '🎬' },
  tecnologia: { colorKey: 'blue', icon: '💻' },
  otros: { colorKey: 'slate', icon: '•' },
  'transferencias propias': { colorKey: 'slate', icon: '↔️' },
};

export const SYSTEM_CATEGORY_ITEMS: CategoryCatalogItem[] = COMMON_TRANSACTION_CATEGORIES.map((label) => {
  const key = normalizeLabel(label);
  const visual = VISUALS[key] ?? { colorKey: 'slate' as const, icon: '•' };
  return { id: null, key, label, kind: 'SYSTEM', ...visual, isArchived: false };
});

