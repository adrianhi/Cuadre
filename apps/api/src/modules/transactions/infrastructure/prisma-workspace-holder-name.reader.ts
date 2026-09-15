import { prisma } from '../../../config/database';
import type { WorkspaceHolderNameReader } from '../application/transaction-store.port';

export class PrismaWorkspaceHolderNameReader implements WorkspaceHolderNameReader {
  async listOwnerDisplayNames(workspaceId: string): Promise<string[]> {
    const owners = await prisma.workspaceMember.findMany({
      where: { workspaceId, role: 'OWNER', profile: { displayName: { not: null } } },
      select: { profile: { select: { displayName: true } } },
    });
    return owners.map((item) => item.profile.displayName).filter((name): name is string => Boolean(name));
  }
}
