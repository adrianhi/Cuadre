export interface SyncCompletedEmailInput {
  recipient: string;
  userDisplayName?: string | null;
  scanned: number;
  created: number;
  institutions: string[];
  appUrl: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character);
}

export function buildSyncCompletedEmail(input: SyncCompletedEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const name = escapeHtml(input.userDisplayName?.trim() || 'ahorrador');
  const appTransactionsUrl = escapeHtml(new URL('/app', input.appUrl).toString());
  const privacyUrl = escapeHtml(new URL('/legal/privacy', input.appUrl).toString());
  const bankNames = input.institutions.length > 0
    ? input.institutions.map(escapeHtml).join(', ')
    : 'Tus bancos autorizados';

  const hasCreated = input.created > 0;
  const subject = hasCreated
    ? '🎉 Tus transacciones ya están listas en Cuadre'
    : 'Sincronización de movimientos completada • Cuadre';

  const title = hasCreated
    ? 'Tus movimientos ya están listos'
    : 'Sincronización finalizada';

  const headline = hasCreated
    ? `Completamos el análisis de tus correos bancarios en Gmail. Hemos importado tus transacciones para que tu <strong>Margen Seguro Diario</strong> esté actualizado.`
    : `Completamos el análisis de tus correos bancarios en Gmail. No detectamos transacciones pendientes en tus bancos seleccionados, pero tu cuenta ya está conectada y monitoreando en segundo plano.`;

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#0f172a;border:1px solid #1e293b;border-radius:20px;overflow:hidden">
    <!-- Header -->
    <tr>
      <td style="padding:32px 28px 24px;text-align:center;background:linear-gradient(180deg, #111e38 0%, #0f172a 100%);border-bottom:1px solid #1e293b">
        <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:13px;background:#10b981;color:#ffffff;font-size:22px;font-weight:900;margin-bottom:12px">C.</div>
        <p style="margin:0 0 6px;color:#34d399;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Sincronización completada</p>
        <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.25">${title}</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:28px 28px 32px">
        <p style="margin:0 0 16px;color:#e2e8f0;font-size:15px;line-height:1.6">Hola <strong>${name}</strong>,</p>
        <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6">${headline}</p>

        <!-- Stats Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#111c33;border:1px solid #1e293b;border-radius:16px;margin-bottom:24px">
          <tr>
            <td style="padding:20px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e293b">
                    <span style="font-size:13px;color:#94a3b8">Movimientos agregados:</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right">
                    <strong style="font-size:16px;color:#10b981">${input.created}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #1e293b">
                    <span style="font-size:13px;color:#94a3b8">Correos analizados:</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right">
                    <strong style="font-size:14px;color:#f1f5f9">${input.scanned}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0">
                    <span style="font-size:13px;color:#94a3b8">Bancos procesados:</span>
                  </td>
                  <td style="padding:8px 0;text-align:right">
                    <strong style="font-size:13px;color:#cbd5e1">${bankNames}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
          <tr>
            <td style="text-align:center">
              <a href="${appTransactionsUrl}" style="display:inline-block;padding:14px 28px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:-0.2px;box-shadow:0 4px 14px rgba(16,185,129,0.3)">
                Ver mis movimientos en Cuadre →
              </a>
            </td>
          </tr>
        </table>

        <!-- Note -->
        <p style="margin:24px 0 0;padding:14px 18px;background:#0c1324;border-left:3px solid #10b981;border-radius:6px;font-size:12px;line-height:1.6;color:#94a3b8">
          💡 <strong>Monitoreo continuo:</strong> Cada vez que realices una compra o pago y tu banco te notifique por correo, Cuadre lo registrará automáticamente sin que tengas que volver a importar.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 28px;background:#090d1a;border-top:1px solid #1e293b;color:#64748b;font-size:11px;line-height:1.6;text-align:center">
        Cuadre utiliza acceso de solo lectura oficial de Google (<code>gmail.readonly</code>) para identificar únicamente notificaciones bancarias. No puede enviar correos ni mover fondos.<br>
        <a href="${privacyUrl}" style="color:#94a3b8;text-decoration:underline">Política de Privacidad</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${title}

Hola ${input.userDisplayName?.trim() || 'ahorrador'},

${hasCreated ? 'Completamos el análisis de tus correos bancarios en Gmail. Hemos importado tus transacciones para que tu Margen Seguro Diario esté actualizado.' : 'Completamos el análisis de tus correos bancarios en Gmail. No detectamos transacciones pendientes en tus bancos seleccionados, pero tu cuenta ya está conectada y monitoreando en segundo plano.'}

Resumen:
- Movimientos agregados: ${input.created}
- Correos analizados: ${input.scanned}
- Bancos procesados: ${input.institutions.join(', ') || 'Bancos autorizados'}

Accede a tu panel en:
${input.appUrl}/app

Monitoreo continuo: cada vez que tu banco envíe un aviso por correo, Cuadre lo registrará automáticamente sin necesidad de sincronizaciones manuales.

Cuadre utiliza acceso de solo lectura oficial de Google (gmail.readonly).
Política de Privacidad: ${new URL('/legal/privacy', input.appUrl).toString()}`;

  return { subject, html, text };
}
