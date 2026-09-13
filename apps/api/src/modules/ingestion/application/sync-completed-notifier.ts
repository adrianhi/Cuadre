import { prisma } from '../../../config/database';
import { logger } from '../../../shared/observability/logger';
import { buildSyncCompletedEmail } from '../domain/sync-completed-email.template';

export interface EmailSenderPort {
  sendEmail(options: {
    recipient: string;
    subject: string;
    html: string;
    text: string;
    idempotencyKey: string;
  }): Promise<unknown>;
}

export interface SyncCompletedSummary {
  scanned: number;
  created: number;
}

export class SyncCompletedNotifier {
  public constructor(
    private readonly emailTransport: EmailSenderPort,
    private readonly appUrl: string
  ) {}

  public async notify(
    workspaceId: string,
    inboxConnectionId: string,
    summary: SyncCompletedSummary,
    jobId?: string
  ): Promise<void> {
    try {
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId, role: 'OWNER' },
        include: { profile: true },
      });

      if (!member?.profile?.email) {
        logger.warn('sync_completed_notifier_skipped_no_email', { workspaceId, inboxConnectionId });
        return;
      }

      const subscriptions = await prisma.inboxInstitutionSubscription.findMany({
        where: { inboxConnectionId, enabled: true },
        include: { institution: true },
      });

      const institutions = subscriptions
        .map((sub) => sub.institution?.displayName || sub.institutionCode)
        .filter(Boolean);

      const emailContent = buildSyncCompletedEmail({
        recipient: member.profile.email,
        userDisplayName: member.profile.displayName,
        scanned: summary.scanned,
        created: summary.created,
        institutions,
        appUrl: this.appUrl,
      });

      const idempotencyKey = `cuadre/sync-completed/${inboxConnectionId}/${jobId || Date.now()}`;

      await this.emailTransport.sendEmail({
        recipient: member.profile.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        idempotencyKey,
      });

      logger.info('sync_completed_email_sent', {
        workspaceId,
        inboxConnectionId,
        recipient: member.profile.email,
        created: summary.created,
        scanned: summary.scanned,
      });
    } catch (error) {
      logger.error('sync_completed_email_failed', {
        workspaceId,
        inboxConnectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
