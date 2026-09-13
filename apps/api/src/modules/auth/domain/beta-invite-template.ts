export interface BetaInviteEmailInput {
  activationUrl: string;
  appUrl: string;
  trialDays: number;
  expiresAt: Date;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character);
}

export function buildBetaInviteEmail(input: BetaInviteEmailInput) {
  const activationUrl = escapeHtml(input.activationUrl);
  const privacyUrl = escapeHtml(new URL('/legal/privacy', input.appUrl).toString());
  const expiration = input.expiresAt.toLocaleDateString('es-DO', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santo_Domingo',
  });
  const subject = 'Tu acceso a la beta privada de Cuadre está listo 🇩🇴';
  const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#0f172a;border:1px solid #1e293b;border-radius:20px;overflow:hidden">
<tr><td style="padding:30px 26px 20px;text-align:center"><div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:13px;background:#10b981;color:#fff;font-size:23px;font-weight:900">C.</div><p style="margin:18px 0 6px;color:#34d399;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Beta privada</p><h1 style="margin:0;color:#fff;font-size:25px;line-height:1.25">Tu invitación de fundador está lista</h1><p style="margin:12px auto 0;max-width:470px;color:#94a3b8;font-size:15px;line-height:1.6">Tendrás ${input.trialDays} días sin costo desde que actives tu cuenta.</p></td></tr>
<tr><td style="padding:6px 26px 28px"><div style="padding:20px;background:#111c33;border:1px solid #1e293b;border-radius:14px"><p style="margin:0 0 13px;color:#fff;font-weight:700">Con Cuadre podrás:</p><p style="margin:8px 0;color:#cbd5e1;font-size:14px;line-height:1.5">✓ Consultar tu Margen Seguro Diario.</p><p style="margin:8px 0;color:#cbd5e1;font-size:14px;line-height:1.5">✓ Conectar las notificaciones de BHD, Banreservas, Popular y Qik mediante Gmail.</p><p style="margin:8px 0;color:#cbd5e1;font-size:14px;line-height:1.5">✓ Recibir tu Pulso Semanal y anticipar cobros fijos.</p></div>
<p style="margin:22px 0 8px;color:#e2e8f0;font-size:14px;line-height:1.6"><strong>Importante:</strong> inicia sesión con la misma cuenta de Google en la que recibiste este mensaje.</p>
<p style="margin:24px 0;text-align:center"><a href="${activationUrl}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:#10b981;color:#fff;text-decoration:none;font-size:15px;font-weight:800">Activar mi acceso</a></p>
<p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;text-align:center">Este enlace vence el ${escapeHtml(expiration)}. Si el botón no funciona, copia esta dirección:<br><a href="${activationUrl}" style="color:#34d399;word-break:break-all">${activationUrl}</a></p></td></tr>
<tr><td style="padding:20px 26px;border-top:1px solid #1e293b;color:#64748b;font-size:11px;line-height:1.6;text-align:center">Cuadre utiliza acceso de solo lectura a Gmail para procesar notificaciones compatibles. No puede transferir ni mover tus fondos.<br><a href="${privacyUrl}" style="color:#94a3b8">Política de Privacidad</a></td></tr>
</table></body></html>`;
  const text = `Tu invitación de fundador a Cuadre está lista

Tendrás ${input.trialDays} días sin costo desde que actives tu cuenta.

Con Cuadre podrás consultar tu Margen Seguro Diario, conectar mediante Gmail las notificaciones de BHD, Banreservas, Popular y Qik, y recibir tu Pulso Semanal.

Importante: inicia sesión con la misma cuenta de Google en la que recibiste este mensaje.

Activar mi acceso: ${input.activationUrl}
Este enlace vence el ${expiration}.

Cuadre utiliza acceso de solo lectura a Gmail para procesar notificaciones compatibles. No puede transferir ni mover tus fondos.
Política de Privacidad: ${new URL('/legal/privacy', input.appUrl).toString()}`;
  return { subject, html, text };
}
