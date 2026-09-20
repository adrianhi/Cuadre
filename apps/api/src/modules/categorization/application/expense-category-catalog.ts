import { COMMON_EXPENSE_CATEGORIES, INTERNAL_TRANSFER_CATEGORY } from '@bills/contracts';
import { normalizeLabel, isIncomeCategory } from '../../../shared/domain/normalize-label';
import type { ExpenseCategoryCatalog, RuleCatalogSource } from './rule.ports';
import type { CustomCategoryLabelSource } from './category-catalog.ports';

export class ListExpenseCategories implements ExpenseCategoryCatalog {
  constructor(private readonly source: RuleCatalogSource, private readonly custom?: CustomCategoryLabelSource) {}
  async list(workspaceId: string) {
    const categories = new Map<string, string>();
    const customLabels = await this.custom?.activeLabels(workspaceId) ?? [];
    const archivedKeys = new Set(await this.custom?.archivedKeys(workspaceId) ?? []);
    for (const label of [...COMMON_EXPENSE_CATEGORIES, ...customLabels, ...await this.source.categoryLabels(workspaceId)]) {
      const key = normalizeLabel(label);
      if (key && !archivedKeys.has(key) && !isIncomeCategory(label) && label.trim() !== INTERNAL_TRANSFER_CATEGORY && !categories.has(key)) {
        categories.set(key, label.trim());
      }
    }
    return [...categories].map(([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }
}
