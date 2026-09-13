import { describe, expect, it } from 'vitest';
import { buildBetaInviteEmail } from '../src/modules/auth/domain/beta-invite-template';

describe('buildBetaInviteEmail', () => {
  it('builds safe HTML and plain text with the agreed beta offer', () => {
    const result = buildBetaInviteEmail({
      activationUrl: 'https://cuadre.example/login?invite=abc&next=<script>',
      appUrl: 'https://cuadre.example',
      trialDays: 30,
      expiresAt: new Date('2026-09-27T12:00:00Z'),
    });
    expect(result.subject).toContain('beta privada');
    expect(result.html).toContain('30 días sin costo');
    expect(result.html).toContain('abc&amp;next=&lt;script&gt;');
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('precio congelado');
    expect(result.text).toContain('acceso de solo lectura a Gmail');
    expect(result.text).not.toContain('90 días');
  });
});
