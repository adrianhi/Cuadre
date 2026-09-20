import type { CategoryColorKey } from '@bills/contracts';

export interface WorkspaceCategoryRecord {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  colorKey: string;
  icon: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceCategoryRepository {
  list(workspaceId: string, includeArchived: boolean): Promise<WorkspaceCategoryRecord[]>;
  findByKey(workspaceId: string, key: string): Promise<WorkspaceCategoryRecord | null>;
  create(workspaceId: string, input: { key: string; name: string; colorKey: CategoryColorKey; icon: string | null }): Promise<WorkspaceCategoryRecord>;
  update(workspaceId: string, id: string, input: { colorKey?: CategoryColorKey; icon?: string | null; isArchived?: boolean }): Promise<WorkspaceCategoryRecord>;
}

export interface CustomCategoryLabelSource {
  activeLabels(workspaceId: string): Promise<string[]>;
  archivedKeys(workspaceId: string): Promise<string[]>;
}
