import { prisma } from '../../../config/database';
import type {
  SyncCompletedContext,
  SyncCompletedContextReader,
} from '../application/sync-completed-notifier';

export class PrismaSyncCompletedContextReader implements SyncCompletedContextReader {
  public async find(workspaceId: string, inboxConnectionId: string): Promise<SyncCompletedContext | null> {
    const [member, subscriptions] = await Promise.all([
      prisma.workspaceMember.findFirst({
        where: { workspaceId, role: 'OWNER' },
        include: { profile: true },
      }),
      prisma.inboxInstitutionSubscription.findMany({
        where: { inboxConnectionId, enabled: true },
        include: { institution: true },
      }),
    ]);

    if (!member?.profile?.email) return null;
    return {
      recipient: member.profile.email,
      userDisplayName: member.profile.displayName,
      institutions: subscriptions.map(
        (subscription) => subscription.institution?.displayName || subscription.institutionCode,
      ),
    };
  }
}
