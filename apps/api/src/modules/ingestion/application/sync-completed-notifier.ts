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

export interface SyncCompletedContext {
  recipient: string;
  userDisplayName?: string | null;
  institutions: string[];
}

export interface SyncCompletedContextReader {
  find(workspaceId: string, inboxConnectionId: string): Promise<SyncCompletedContext | null>;
}

export class SyncCompletedNotifier {
  public constructor(
    private readonly emailTransport: EmailSenderPort,
    private readonly contextReader: SyncCompletedContextReader,
    private readonly appUrl: string
  ) {}

  public async notify(
    workspaceId: string,
    inboxConnectionId: string,
    summary: SyncCompletedSummary,
    jobId?: string
  ): Promise<void> {
    try {
      const context = await this.contextReader.find(workspaceId, inboxConnectionId);
      if (!context) {
        logger.warn('sync_completed_notifier_skipped_no_email', { workspaceId, inboxConnectionId });
        return;
      }

      const emailContent = buildSyncCompletedEmail({
        recipient: context.recipient,
        userDisplayName: context.userDisplayName,
        scanned: summary.scanned,
        created: summary.created,
        institutions: context.institutions,
        appUrl: this.appUrl,
      });

      const idempotencyKey = `cuadre/sync-completed/${inboxConnectionId}/${jobId || Date.now()}`;

      await this.emailTransport.sendEmail({
        recipient: context.recipient,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        idempotencyKey,
      });

      logger.info('sync_completed_email_sent', {
        workspaceId,
        inboxConnectionId,
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
