import crypto from 'node:crypto';
import { z } from 'zod';
import { buildBetaInviteEmail } from '../domain/beta-invite-template';

const EmailSchema = z.string().trim().toLowerCase().email();
const INVITE_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;
const DEFAULT_TRIAL_DAYS = 30;

export interface BetaInviteRecord {
  id: string; email: string; code: string | null; expiresAt: Date | null; usedAt: Date | null;
  trialDays: number; emailDispatchVersion: number; source: string | null; campaignCode: string | null;
}

export interface BetaInviteStore {
  findOrCreate(input: {
    email: string; code: string; expiresAt: Date; trialDays: number;
    source?: string; campaignCode?: string;
  }): Promise<BetaInviteRecord>;
  refreshLink(input: {
    id: string; expectedVersion: number; code: string; expiresAt: Date; incrementDispatch: boolean;
  }): Promise<BetaInviteRecord | null>;
  advanceDispatch(id: string, expectedVersion: number): Promise<BetaInviteRecord | null>;
  oldestPendingInterests(limit: number): Promise<Array<{ email: string; campaignCode: string | null }>>;
  funnelMetrics(): Promise<BetaFunnelMetrics>;
}

export interface BetaInviteDeliveryView {
  id: string; status: string; deliveryMode: 'SMTP' | 'AUDIT_LOG' | null;
  providerMessageId: string | null; errorCode: string | null; processedAt: Date | null;
  nextAttemptAt: Date; contextKey: string;
}

export interface BetaInviteEmailQueue {
  enqueueBetaInvite(input: {
    betaInviteId: string; recipient: string; contextKey: string;
    subject: string; html: string; text: string; headers?: Record<string, string>;
  }): Promise<{ id: string; created: boolean }>;
  latestBetaInviteDelivery(betaInviteId: string): Promise<BetaInviteDeliveryView | null>;
  betaInviteDelivery(id: string): Promise<BetaInviteDeliveryView | null>;
  suppressRetryableBetaInviteDeliveries(betaInviteId: string, now: Date): Promise<number>;
}

export interface BetaInviteEmailProcessor {
  processNext(id?: string, now?: Date): Promise<{ processed: boolean; accepted: boolean; mode?: 'SMTP' | 'AUDIT_LOG' }>;
}

export interface BetaFunnelMetrics {
  interestedTotal: number; interestedPending: number; invitedTotal: number; activatedTotal: number;
  onboardingCompleted: number; gmailConnectedUsers: number; enabledBanks: number;
  emailNotSent: number; emailAudit: number; emailAccepted: number; emailDelivered: number;
  emailPending: number; emailFailed: number; conversionPercent: number;
}

export type InviteUserResult = {
  email: string; activationUrl: string; used: boolean; emailRequested: boolean;
  delivery: BetaInviteDeliveryView | null; firstAttemptAccepted: boolean;
};

function newCode() {
  return crypto.randomBytes(32).toString('base64url');
}

function expiration(now: Date) {
  return new Date(now.getTime() + INVITE_LIFETIME_MS);
}

export class BetaInviteService {
  constructor(
    private readonly store: BetaInviteStore,
    private readonly queue: BetaInviteEmailQueue,
    private readonly processor: BetaInviteEmailProcessor,
    private appUrl: string,
  ) {}

  setAppUrl(appUrl: string) {
    this.appUrl = appUrl;
  }

  getAppUrl(): string {
    return this.appUrl;
  }

  private activationUrl(code: string) {
    const url = new URL('/login', this.appUrl);
    url.searchParams.set('invite', code);
    return url.toString();
  }

  async inviteUser(input: {
    email: string; sendEmail?: boolean; forceResend?: boolean;
    source?: string; campaignCode?: string; now?: Date;
  }): Promise<InviteUserResult> {
    const email = EmailSchema.parse(input.email);
    const now = input.now || new Date();
    const sendEmail = input.sendEmail !== false;
    let invite = await this.store.findOrCreate({
      email, code: newCode(), expiresAt: expiration(now), trialDays: DEFAULT_TRIAL_DAYS,
      source: input.source, campaignCode: input.campaignCode,
    });

    if (invite.usedAt) {
      return { email, activationUrl: invite.code ? this.activationUrl(invite.code) : '', used: true,
        emailRequested: sendEmail, delivery: null, firstAttemptAccepted: false };
    }

    if (!sendEmail) {
      if (!invite.code || !invite.expiresAt || invite.expiresAt <= now) {
        const refreshed = await this.store.refreshLink({
          id: invite.id, expectedVersion: invite.emailDispatchVersion,
          code: newCode(), expiresAt: expiration(now), incrementDispatch: false,
        });
        if (refreshed) invite = refreshed;
      }
      if (!invite.code) throw new Error('BETA_INVITE_LINK_CREATE_FAILED');
      return { email, activationUrl: this.activationUrl(invite.code), used: false,
        emailRequested: false, delivery: null, firstAttemptAccepted: false };
    }

    const latest = await this.queue.latestBetaInviteDelivery(invite.id);
    const linkExpired = !invite.expiresAt || invite.expiresAt <= now;
    if (latest && !input.forceResend && (!invite.code || linkExpired)) {
      throw new Error('BETA_INVITE_EXPIRED_USE_RESEND');
    }
    if (latest && !input.forceResend) {
      const attempt = await this.processor.processNext(latest.id, now);
      return { email, activationUrl: invite.code ? this.activationUrl(invite.code) : '', used: false,
        emailRequested: true, delivery: await this.queue.betaInviteDelivery(latest.id),
        firstAttemptAccepted: attempt.accepted || ['ACCEPTED', 'DELIVERED'].includes(latest.status) };
    }

    if (input.forceResend && latest?.status === 'PROCESSING') {
      throw new Error('BETA_INVITE_SEND_IN_PROGRESS');
    }
    if (input.forceResend) await this.queue.suppressRetryableBetaInviteDeliveries(invite.id, now);

    const rotateLink = Boolean(input.forceResend) || !invite.code || linkExpired;
    const prepared = rotateLink
      ? await this.store.refreshLink({ id: invite.id, expectedVersion: invite.emailDispatchVersion,
          code: newCode(), expiresAt: expiration(now), incrementDispatch: true })
      : await this.store.advanceDispatch(invite.id, invite.emailDispatchVersion);
    if (!prepared?.code || !prepared.expiresAt) throw new Error('BETA_INVITE_DISPATCH_CONFLICT');
    invite = prepared;

    const activationUrl = this.activationUrl(prepared.code);
    const content = buildBetaInviteEmail({ activationUrl, appUrl: this.appUrl,
      trialDays: prepared.trialDays, expiresAt: prepared.expiresAt });
    const queued = await this.queue.enqueueBetaInvite({
      betaInviteId: invite.id, recipient: email, contextKey: `dispatch:${invite.emailDispatchVersion}`, ...content,
    });
    const attempt = await this.processor.processNext(queued.id, now);
    return { email, activationUrl, used: false, emailRequested: true,
      delivery: await this.queue.betaInviteDelivery(queued.id), firstAttemptAccepted: attempt.accepted };
  }

  async inviteBatchFromWaitlist(limit: number) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('WAITLIST_LIMIT_INVALID');
    const interests = await this.store.oldestPendingInterests(limit);
    const results: InviteUserResult[] = [];
    for (const interest of interests) {
      try {
        results.push(await this.inviteUser({ email: interest.email, source: 'WAITLIST',
          campaignCode: interest.campaignCode || undefined }));
      } catch {
        results.push({ email: interest.email, activationUrl: '', used: false,
          emailRequested: true, delivery: null, firstAttemptAccepted: false });
      }
    }
    return {
      requested: limit, selected: interests.length, accepted: results.filter((item) => item.firstAttemptAccepted).length,
      failed: results.filter((item) => !item.firstAttemptAccepted).length, results,
    };
  }

  getFunnelMetrics() {
    return this.store.funnelMetrics();
  }
}
