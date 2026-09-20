import { prisma } from '../../../config/database';
import { AppError } from '../../../errors/app-error';
import { normalizeLabel } from '../../../shared/domain/normalize-label';
import type { WorkspaceCategoryRepository } from '../application/category-catalog.ports';
import { assertNoActiveApplication, lockRuleWorkspace } from './workspace-rule-lock';

export class PrismaWorkspaceCategoryRepository implements WorkspaceCategoryRepository {
  list(workspaceId: string, includeArchived: boolean) {
    return prisma.workspaceCategory.findMany({
      where: { workspaceId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: { name: 'asc' },
    });
  }

  findByKey(workspaceId: string, key: string) {
    return prisma.workspaceCategory.findUnique({ where: { workspaceId_key: { workspaceId, key } } });
  }

  async create(workspaceId: string, input: Parameters<WorkspaceCategoryRepository['create']>[1]) {
    try {
      return await prisma.workspaceCategory.create({ data: { workspaceId, ...input } });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'Ya existe una categoría con ese nombre.');
      }
      throw error;
    }
  }

  async update(workspaceId: string, id: string, input: Parameters<WorkspaceCategoryRepository['update']>[2]) {
    return prisma.$transaction(async (tx) => {
      await lockRuleWorkspace(tx, workspaceId);
      await assertNoActiveApplication(tx, workspaceId);
      const category = await tx.workspaceCategory.findFirst({ where: { id, workspaceId } });
      if (!category) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Categoría no encontrada.');
      if (input.isArchived === true && !category.isArchived) {
        const activeRules = await tx.categoryRule.findMany({
          where: { workspaceId, isActive: true }, select: { id: true, category: true },
        });
        const ids = activeRules.filter((rule) => normalizeLabel(rule.category) === category.key).map((rule) => rule.id);
        if (ids.length) await tx.categoryRule.updateMany({ where: { workspaceId, id: { in: ids } }, data: { isActive: false, version: { increment: 1 } } });
      }
      return tx.workspaceCategory.update({ where: { id }, data: input });
    });
  }

  async activeLabels(workspaceId: string) {
    const rows = await prisma.workspaceCategory.findMany({ where: { workspaceId, isArchived: false }, select: { name: true } });
    return rows.map((row) => row.name);
  }

  async archivedKeys(workspaceId: string) {
    const rows = await prisma.workspaceCategory.findMany({ where: { workspaceId, isArchived: true }, select: { key: true } });
    return rows.map((row) => row.key);
  }
}
