import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryCatalogService } from '../src/modules/categorization/application/category-catalog.service';
import type { WorkspaceCategoryRecord, WorkspaceCategoryRepository } from '../src/modules/categorization/application/category-catalog.ports';

const now = new Date('2026-09-19T00:00:00.000Z');
const custom = (overrides: Partial<WorkspaceCategoryRecord> = {}): WorkspaceCategoryRecord => ({
  id: 'category-1', workspaceId: 'workspace-1', key: 'gimnasio', name: 'Gimnasio', colorKey: 'violet',
  icon: '🏋️', isArchived: false, createdAt: now, updatedAt: now, ...overrides,
});

function repository(rows = [custom()]): WorkspaceCategoryRepository {
  return {
    list: vi.fn(async (_workspaceId, includeArchived) => rows.filter((row) => includeArchived || !row.isArchived)),
    findByKey: vi.fn(async (_workspaceId, key) => rows.find((row) => row.key === key) ?? null),
    create: vi.fn(async (workspaceId, input) => custom({ ...input, workspaceId })),
    update: vi.fn(async (_workspaceId, id, input) => custom({ id, ...input })),
  };
}

const history = (labels: string[] = []) => ({ categoryLabels: vi.fn().mockResolvedValue(labels), merchants: vi.fn().mockResolvedValue([]) });

describe('CategoryCatalogService', () => {
  it('combines system, custom and unmigrated historical labels without duplicates', async () => {
    const service = new CategoryCatalogService(repository(), history(['Gimnasio', 'Mascotas']));
    const result = await service.list('workspace-1');
    expect(result.find((item) => item.label === 'Supermercado')?.kind).toBe('SYSTEM');
    expect(result.find((item) => item.label === 'Gimnasio')).toMatchObject({ kind: 'CUSTOM', icon: '🏋️' });
    expect(result.find((item) => item.label === 'Mascotas')?.kind).toBe('LEGACY');
    expect(result.filter((item) => item.key === 'gimnasio')).toHaveLength(1);
  });

  it('normalizes names and rejects collisions with system, active or archived categories', async () => {
    const store = repository([custom({ isArchived: true })]);
    const service = new CategoryCatalogService(store, history());
    await expect(service.create('workspace-1', { name: '  Súpermercado ', colorKey: 'blue' })).rejects.toMatchObject({ code: 'CATEGORY_ALREADY_EXISTS' });
    await expect(service.create('workspace-1', { name: 'GÍMNASIO', colorKey: 'blue' })).rejects.toMatchObject({ code: 'CATEGORY_ALREADY_EXISTS' });
  });

  it('creates categories and uses soft archive updates', async () => {
    const store = repository([]);
    const service = new CategoryCatalogService(store, history());
    await expect(service.create('workspace-1', { name: ' Educación ', colorKey: 'amber', icon: '📚' }))
      .resolves.toMatchObject({ key: 'educacion', label: 'Educación', kind: 'CUSTOM' });
    await service.archive('workspace-1', 'category-1');
    expect(store.update).toHaveBeenCalledWith('workspace-1', 'category-1', { isArchived: true });
  });
});

const tx = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  workspaceCategory: { findFirst: vi.fn(), update: vi.fn() },
  categoryRule: { findMany: vi.fn(), updateMany: vi.fn() },
  ruleApplication: { count: vi.fn() },
}));
vi.mock('../src/config/database', () => ({ prisma: {
  $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  workspaceCategory: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
} }));

describe('PrismaWorkspaceCategoryRepository archive transaction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deactivates matching rules atomically and preserves unrelated rules', async () => {
    const { PrismaWorkspaceCategoryRepository } = await import('../src/modules/categorization/infrastructure/prisma-workspace-category.repository');
    tx.workspaceCategory.findFirst.mockResolvedValue(custom());
    tx.ruleApplication.count.mockResolvedValue(0);
    tx.workspaceCategory.update.mockResolvedValue(custom({ isArchived: true }));
    tx.categoryRule.findMany.mockResolvedValue([
      { id: 'matching', category: 'GÍMNASIO' }, { id: 'other', category: 'Mascotas' },
    ]);
    await new PrismaWorkspaceCategoryRepository().update('workspace-1', 'category-1', { isArchived: true });
    expect(tx.categoryRule.updateMany).toHaveBeenCalledWith({
      where: { workspaceId: 'workspace-1', id: { in: ['matching'] } },
      data: { isActive: false, version: { increment: 1 } },
    });
    expect(tx.workspaceCategory.update).toHaveBeenCalledWith({ where: { id: 'category-1' }, data: { isArchived: true } });
  });
});
