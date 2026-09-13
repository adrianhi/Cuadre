import { betaInterestInputSchema, type BetaInterestInput, type BetaInterestResponse } from '@bills/contracts';
import { logger } from '../../../shared/observability/logger';

export interface BetaInterestRepository {
  findByEmail(email: string): Promise<{ id: string; email: string } | null>;
  create(data: { email: string; source?: string; campaignCode?: string; referredBy?: string }): Promise<{ id: string; email: string }>;
}

export interface BetaAutoInviter {
  inviteUser(input: {
    email: string;
    sendEmail?: boolean;
    forceResend?: boolean;
    source?: string;
    campaignCode?: string;
  }): Promise<{ activationUrl: string; used?: boolean }>;
}

export class BetaInterestService {
  constructor(
    private readonly repository: BetaInterestRepository,
    private readonly autoInviter?: BetaAutoInviter,
  ) {}

  async register(input: BetaInterestInput): Promise<BetaInterestResponse> {
    const parsed = betaInterestInputSchema.parse(input);
    const normalizedEmail = parsed.email.trim().toLowerCase();

    const existing = await this.repository.findByEmail(normalizedEmail);
    if (!existing) {
      await this.repository.create({
        email: normalizedEmail,
        source: parsed.source || 'LANDING_DIRECT',
        campaignCode: parsed.campaignCode,
        referredBy: parsed.referredBy,
      });
    }

    let activationUrl: string | undefined;
    let inviteCode: string | undefined;

    if (this.autoInviter) {
      try {
        const invite = await this.autoInviter.inviteUser({
          email: normalizedEmail,
          source: parsed.source || 'LANDING_HERO',
          campaignCode: parsed.campaignCode,
          sendEmail: true,
        });
        if (invite?.activationUrl) {
          activationUrl = invite.activationUrl;
          try {
            const urlObj = new URL(activationUrl);
            inviteCode = urlObj.searchParams.get('invite') || undefined;
          } catch {
            // ignore
          }
        }
      } catch (error) {
        logger.warn('beta_auto_invite_failed', {
          email: normalizedEmail,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });
      }
    }

    return {
      success: true,
      message: existing
        ? '¡Ya estás en la lista! Tu invitación está lista para activar tu acceso.'
        : '¡Tu acceso a la beta está listo! Tienes 30 días de prueba sin costo.',
      alreadyRegistered: existing ? true : undefined,
      activationUrl,
      inviteCode,
    };
  }
}
