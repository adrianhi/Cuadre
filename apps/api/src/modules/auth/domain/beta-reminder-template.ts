export interface BetaReminderEmailInput {
  activationUrl: string;
  appUrl: string;
  trialDays: number;
  expiresAt: Date;
  recipientEmail?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character);
}

export function buildBetaReminderEmail(input: BetaReminderEmailInput) {
  const activationUrl = escapeHtml(input.activationUrl);
  const privacyUrl = escapeHtml(new URL('/legal/privacy', input.appUrl).toString());
  const expiration = input.expiresAt.toLocaleDateString('es-DO', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santo_Domingo',
  });
  const subject = '⏰ Tu cupo de fundador en Cuadre vence pronto (+ Modo Coro y novedades) 🇩🇴';

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#0f172a;border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
  <!-- Header -->
  <tr>
    <td style="padding:32px 24px 20px 24px;text-align:center;background:linear-gradient(180deg, #111e38 0%, #0f172a 100%);border-bottom:1px solid #1e293b;">
      <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:13px;background:#10b981;color:#fff;font-size:23px;font-weight:900;">C.</div>
      <div style="margin-top:14px;">
        <span style="display:inline-block;background:#f59e0b20;border:1px solid #f59e0b50;color:#fbbf24;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;padding:4px 10px;border-radius:9999px;">⏰ Cupo de Fundador por Vencer</span>
      </div>
      <h1 style="margin:12px 0 6px 0;color:#fff;font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-0.5px;">No te quedes fuera de la beta privada</h1>
      <p style="margin:0 auto;max-width:470px;color:#94a3b8;font-size:14px;line-height:1.5;">Vimos que te inscribiste en la lista de espera pero aún no has activado tu acceso. Renovamos tu invitación para que disfrutes tus <strong>${input.trialDays} días sin costo</strong>.</p>
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="padding:24px 24px 28px 24px;">
      <p style="margin:0 0 16px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">Además, acabamos de lanzar nuevas herramientas que vas a querer usar hoy mismo:</p>

      <!-- Highlights Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#111c33;border:1px solid #1e293b;border-radius:14px;margin-bottom:20px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 10px 0;color:#fff;font-weight:700;font-size:14px;">Lo nuevo esperándote en tu cuenta:</p>
            <p style="margin:8px 0;color:#cbd5e1;font-size:13px;line-height:1.5;">🍻 <strong>Modo Coro:</strong> Divide la cuenta de salidas o viajes entre panas y comparte el cobro por WhatsApp con tus cuentas bancarias (Banreservas, Popular, BHD o Qik).</p>
            <p style="margin:8px 0;color:#cbd5e1;font-size:13px;line-height:1.5;">🏷️ <strong>Centro de Categorías:</strong> Clasifica tus movimientos pendientes en un solo clic con buscador rápido.</p>
            <p style="margin:8px 0;color:#cbd5e1;font-size:13px;line-height:1.5;">🟢 <strong>Margen Seguro Diario:</strong> El número que te dice exactamente cuánto dinero puedes gastar hoy sin descuadrar la quincena.</p>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0 14px 0;">
        <a href="${activationUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:#10b981;color:#fff;text-decoration:none;font-size:15px;font-weight:800;box-shadow:0 4px 14px rgba(16,185,129,0.35);">Activar mi Acceso de Fundador</a>
      </div>

      <p style="margin:0 0 20px 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
        Este enlace renovado vence el <strong>${escapeHtml(expiration)}</strong>.<br>
        Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
        <a href="${activationUrl}" style="color:#34d399;word-break:break-all;font-size:11px;">${activationUrl}</a>
      </p>

      <p style="margin:0;color:#cbd5e1;font-size:13px;line-height:1.5;background:#1e293b50;border-left:3px solid #10b981;padding:10px 14px;border-radius:0 8px 8px 0;">
        <strong>Importante:</strong> Inicia sesión con la misma cuenta de Google en la que recibiste este mensaje para activar tus ${input.trialDays} días gratis de inmediato.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 24px;border-top:1px solid #1e293b;color:#64748b;font-size:11px;line-height:1.6;text-align:center;">
      Cuadre utiliza acceso de solo lectura a Gmail para procesar notificaciones compatibles. Nunca te pedirá contraseñas bancarias ni moverá tus fondos.<br>
      <a href="${privacyUrl}" style="color:#94a3b8;text-decoration:underline;">Política de Privacidad</a>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `⏰ Tu cupo de fundador en Cuadre vence pronto (+ Modo Coro y novedades)`,
    `Vimos que te inscribiste en la lista de espera pero aún no has activado tu acceso. Renovamos tu invitación para que disfrutes tus ${input.trialDays} días sin costo.`,
    `Lo nuevo esperándote en tu cuenta:`,
    `- Modo Coro 🍻: Divide la cuenta de salidas o viajes entre panas y comparte el cobro por WhatsApp con tus cuentas de banco (Banreservas, Popular, BHD o Qik).`,
    `- Centro de Categorías 🏷️: Clasifica tus movimientos pendientes en un solo clic con buscador rápido.`,
    `- Margen Seguro Diario 🟢: Sabe exactamente cuánto dinero puedes gastar hoy sin descuadrar la quincena.`,
    `Activar mi Acceso de Fundador: ${input.activationUrl}`,
    `Este enlace renovado vence el ${expiration}.`,
    `Importante: Inicia sesión con la misma cuenta de Google en la que recibiste este mensaje.`,
    `Cuadre utiliza acceso de solo lectura para procesar notificaciones bancarias. No puede mover fondos.`,
    `Política de Privacidad: ${privacyUrl}`,
  ].join('\n\n');

  return { subject, html, text };
}
