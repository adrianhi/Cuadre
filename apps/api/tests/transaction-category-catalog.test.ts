import { describe, expect, it } from 'vitest';
import { ListExpenseCategories } from '../src/modules/categorization/application/expense-category-catalog';
import { ListTransactionCategories } from '../src/modules/categorization/application/transaction-category-catalog';

const source = {
  categoryLabels: async () => ['Transferencias Propias', 'Categoría local'],
  merchants: async () => [],
};

describe('transaction category catalogs', () => {
  it('keeps internal transfers out of budgetable categories', async () => {
    const categories = await new ListExpenseCategories(source).list('workspace');
    expect(categories.map((item) => item.label)).not.toContain('Transferencias Propias');
  });

  it('allows internal transfers in transaction rules', async () => {
    const categories = await new ListTransactionCategories(source).list('workspace');
    expect(categories.map((item) => item.label)).toContain('Transferencias Propias');
  });
});
