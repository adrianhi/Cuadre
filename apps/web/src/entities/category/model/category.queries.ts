import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../api/category.service';

export const categoryKeys = {
  all: ['category-catalog'] as const,
  list: (includeArchived: boolean) => ['category-catalog', 'list', includeArchived] as const,
};

export function useCategoryCatalog(enabled = true, includeArchived = false) {
  return useQuery({
    queryKey: categoryKeys.list(includeArchived),
    queryFn: ({ signal }) => categoryService.list(includeArchived, signal),
    enabled,
    staleTime: 5 * 60_000,
  });
}

