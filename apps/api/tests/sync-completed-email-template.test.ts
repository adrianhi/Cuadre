import { describe, expect, it } from 'vitest';
import { buildSyncCompletedEmail } from '../src/modules/ingestion/domain/sync-completed-email.template';

describe('buildSyncCompletedEmail', () => {
  it('renders a celebration subject and content when transactions were created', () => {
    const result = buildSyncCompletedEmail({
      recipient: 'user@example.com',
      userDisplayName: 'Adrian',
      scanned: 35,
      created: 14,
      institutions: ['Banco BHD', 'Banco Popular'],
      appUrl: 'https://cuadre.com.do',
    });

    expect(result.subject).toContain('🎉 Tus transacciones ya están listas en Cuadre');
    expect(result.html).toContain('Hola <strong>Adrian</strong>');
    expect(result.html).toContain('14');
    expect(result.html).toContain('35');
    expect(result.html).toContain('Banco BHD, Banco Popular');
    expect(result.html).toContain('https://cuadre.com.do/app');
    expect(result.text).toContain('Movimientos agregados: 14');
  });

  it('renders clean fallback when 0 transactions were created', () => {
    const result = buildSyncCompletedEmail({
      recipient: 'user@example.com',
      scanned: 10,
      created: 0,
      institutions: ['Banreservas'],
      appUrl: 'https://cuadre.com.do',
    });

    expect(result.subject).toContain('Sincronización de movimientos completada');
    expect(result.html).toContain('ahorrador');
    expect(result.html).toContain('0');
    expect(result.html).toContain('Banreservas');
  });

  it('escapes html to prevent injection', () => {
    const result = buildSyncCompletedEmail({
      recipient: 'user@example.com',
      userDisplayName: '<script>alert("xss")</script>',
      scanned: 1,
      created: 1,
      institutions: ['<evil>&bank'],
      appUrl: 'https://cuadre.com.do',
    });

    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(result.html).toContain('&lt;evil&gt;&amp;bank');
  });
});
