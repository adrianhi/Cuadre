import { describe, expect, it } from 'vitest';
import { renderProductUpdateEmail } from '../src/modules/proactivity/domain/product-update-template';

describe('renderProductUpdateEmail', () => {
  it('renders product update email with 3-step guided flow, deep links and safe escaping', () => {
    const email = renderProductUpdateEmail({
      userDisplayName: '<script>alert(1)</script> Hidalgo',
      appUrl: 'https://app.cuadre.com.do/',
      unsubscribeUrl: 'https://app.cuadre.com.do/unsubscribe?token=xyz',
    });

    expect(email.subject).toContain('Llega Modo Coro');
    expect(email.html).toContain('Hola <strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>');
    expect(email.html).not.toContain('<script>alert(1)</script>');

    // Deep links
    expect(email.html).toContain('https://app.cuadre.com.do/app/control?view=categories');
    expect(email.html).toContain('https://app.cuadre.com.do/app/control?view=budget&amp;tab=recurring');
    expect(email.html).toContain('https://app.cuadre.com.do/app/coro');
    expect(email.html).toContain('https://app.cuadre.com.do/app');

    // Text version
    expect(email.text).toContain('1. Clasifica tus gastos pendientes en 1 clic:');
    expect(email.text).toContain('2. Vincula tus pagos a tus Gastos Fijos:');
    expect(email.text).toContain('3. Consulta tu Margen Seguro Diario:');
    expect(email.text).toContain('Novedad Estrella: Modo Coro');
    expect(email.text).toContain('https://app.cuadre.com.do/app/control?view=categories');
  });

  it('handles empty display name gracefully', () => {
    const email = renderProductUpdateEmail({});
    expect(email.html).toContain('Hola <strong>ahorrador</strong>');
    expect(email.text).toContain('Hola ahorrador,');
  });
});
