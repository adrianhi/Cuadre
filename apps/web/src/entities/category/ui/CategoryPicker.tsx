import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CategoryCatalogItem, CreateCategoryInput } from '@bills/contracts';
import { categoryService } from '../api/category.service';
import { categoryKeys, useCategoryCatalog } from '../model/category.queries';
import { CategorySelect } from './CategorySelect';
import { CreateCategoryDialog } from './CreateCategoryDialog';

export function CategoryPicker(props: {
  value: string;
  onValueChange: (value: string) => void;
  enabled?: boolean;
  allowCreate?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const query = useCategoryCatalog(props.enabled ?? true);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: async (created) => {
      client.setQueryData<CategoryCatalogItem[]>(categoryKeys.list(false), (old) => {
        if (!old) return [created];
        if (old.some((item) => item.label === created.label)) return old;
        return [...old, created];
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: categoryKeys.all }),
        client.invalidateQueries({ queryKey: ['category-rules'] }),
        client.invalidateQueries({ queryKey: ['budgets', 'categories'] }),
      ]);
    },
  });
  return <>
    <CategorySelect items={query.data || []} value={props.value} onValueChange={props.onValueChange}
      placeholder={props.placeholder} emptyLabel={props.emptyLabel} disabled={props.disabled}
      loading={query.isLoading} error={query.error?.message} className={props.className} ariaLabel={props.ariaLabel}
      onCreateRequest={props.allowCreate === false ? undefined : () => setCreateOpen(true)} />
    <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} saving={mutation.isPending}
      error={mutation.error?.message} onCreate={mutation.mutateAsync}
      onCreated={(item) => props.onValueChange(item.label)} />
  </>;
}

