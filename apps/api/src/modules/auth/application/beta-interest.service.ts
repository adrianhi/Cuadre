import { betaInterestInputSchema, type BetaInterestInput, type BetaInterestResponse } from '@bills/contracts';

export interface BetaInterestRepository {
  findByEmail(email: string): Promise<{ id: string; email: string } | null>;
  create(data: { email: string; source?: string; campaignCode?: string; referredBy?: string }): Promise<{ id: string; email: string }>;
}

export class BetaInterestService {
  constructor(private readonly repository: BetaInterestRepository) {}

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

    return {
      success: true,
      message: existing
        ? 'Ya estabas en la lista. No necesitas registrarte otra vez.'
        : 'Recibimos tu solicitud. Te avisaremos por correo cuando tu acceso esté disponible.',
      alreadyRegistered: existing ? true : undefined,
    };
  }
}
