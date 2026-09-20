import {
  categoryColorKeySchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  type CategoryCatalogItem,
  type CategoryColorKey,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@bills/contracts';
import { AppError } from '../../../errors/app-error';
import { normalizeLabel } from '../../../shared/domain/normalize-label';
import { SYSTEM_CATEGORY_ITEMS } from '../domain/system-categories';
import type { RuleCatalogSource } from './rule.ports';
import type { WorkspaceCategoryRecord, WorkspaceCategoryRepository } from './category-catalog.ports';

const FALLBACK_COLORS: CategoryColorKey[] = ['emerald', 'blue', 'amber', 'violet', 'pink', 'cyan', 'slate', 'red'];
const fallbackColor = (key: string) => FALLBACK_COLORS[[...key].reduce((total, char) => total + char.charCodeAt(0), 0) % FALLBACK_COLORS.length];

function toItem(row: WorkspaceCategoryRecord): CategoryCatalogItem {
  return {
    id: row.id,
    key: row.key,
    label: row.name,
    kind: 'CUSTOM',
    colorKey: categoryColorKeySchema.catch('slate').parse(row.colorKey),
    icon: row.icon,
    isArchived: row.isArchived,
  };
}

export class CategoryCatalogService {
  constructor(private readonly repository: WorkspaceCategoryRepository, private readonly history: RuleCatalogSource) {}

  async list(workspaceId: string, includeArchived = false): Promise<CategoryCatalogItem[]> {
    const items = new Map(SYSTEM_CATEGORY_ITEMS.map((item) => [item.key, item]));
    const customRows = await this.repository.list(workspaceId, true);
    const archivedKeys = new Set(customRows.filter((row) => row.isArchived).map((row) => row.key));
    for (const row of customRows) if (includeArchived || !row.isArchived) items.set(row.key, toItem(row));
    for (const label of await this.history.categoryLabels(workspaceId)) {
      const key = normalizeLabel(label);
      if (key && !items.has(key) && (includeArchived || !archivedKeys.has(key))) items.set(key, {
        id: null, key, label: label.trim(), kind: 'LEGACY', colorKey: fallbackColor(key), icon: null, isArchived: false,
      });
    }
    return [...items.values()].sort((left, right) => left.label.localeCompare(right.label, 'es'));
  }

  async create(workspaceId: string, raw: CreateCategoryInput) {
    const input = createCategoryInputSchema.parse(raw);
    const key = normalizeLabel(input.name);
    if (SYSTEM_CATEGORY_ITEMS.some((item) => item.key === key) || await this.repository.findByKey(workspaceId, key)) {
      throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'Ya existe una categoría con ese nombre.');
    }
    return toItem(await this.repository.create(workspaceId, {
      key, name: input.name.trim(), colorKey: input.colorKey, icon: input.icon?.trim() || null,
    }));
  }

  async update(workspaceId: string, id: string, raw: UpdateCategoryInput) {
    const input = updateCategoryInputSchema.parse(raw);
    return toItem(await this.repository.update(workspaceId, id, {
      ...input, ...(input.icon !== undefined ? { icon: input.icon?.trim() || null } : {}),
    }));
  }

  archive(workspaceId: string, id: string) {
    return this.update(workspaceId, id, { isArchived: true });
  }
}
