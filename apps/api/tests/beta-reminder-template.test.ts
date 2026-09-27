import { describe, expect, it } from 'vitest';
import { buildBetaReminderEmail } from '../src/modules/auth/domain/beta-reminder-template';

describe('buildBetaReminderEmail', () => {
  it('renders reminder email with renewed trial, Modo Coro highlights and safe escaping', () => {
    const email = buildBetaReminderEmail({
      activationUrl: 'https://app.cuadre.com.do/login?invite=abc-123&test=<script>',
      appUrl: 'https://app.cuadre.com.do',
      trialDays: 30,
      expiresAt: new Date('2026-10-15T12:00:00Z'),
    });

    expect(email.subject).toContain('vence pronto');
    expect(email.html).toContain('30 días sin costo');
    expect(email.html).toContain('Modo Coro');
    expect(email.html).toContain('abc-123&amp;test=&lt;script&gt;');
    expect(email.html).not.toContain('<script>');
    expect(email.text).toContain('Activar mi Acceso de Fundador');
  });
});
