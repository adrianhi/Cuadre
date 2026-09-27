import { emailFooter, escapeHtml } from './email-template';

export interface ProductUpdateTemplateInput {
  userDisplayName?: string;
  appUrl?: string;
  unsubscribeUrl?: string;
}

export function renderProductUpdateEmail(input: ProductUpdateTemplateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const name = escapeHtml(input.userDisplayName ? input.userDisplayName.split(' ')[0] : 'ahorrador');
  const appUrl = (input.appUrl || 'https://app.cuadre.com.do').replace(/\/$/, '');
  const footer = emailFooter(input.unsubscribeUrl, `${appUrl}/app`);
  const subject = '🍻 Llega Modo Coro, organizador de categorías y tu ruta rápida en Cuadre';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #0b1329; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 24px 24px 24px; text-align: center; border-bottom: 1px solid #1e293b; background: linear-gradient(180deg, #111e38 0%, #0b1329 100%);">
        <div style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 900; font-size: 20px; width: 40px; height: 40px; line-height: 40px; border-radius: 12px; margin-bottom: 12px;">C.</div>
        <div style="display: inline-block; margin-left: 8px; vertical-align: middle; background-color: #10b98120; border: 1px solid #10b98150; color: #34d399; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 9999px;">Novedades & Guía Rápida</div>
        <h1 style="margin: 12px 0 6px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.25;">Tu dinero, ahora más claro y sin enredos</h1>
        <p style="margin: 0 auto; max-width: 480px; font-size: 14px; color: #94a3b8; line-height: 1.5;">Hemos renovado Cuadre para que no pierdas tiempo. Sigue esta ruta de 3 pasos para dejar tu quincena organizada en minutos:</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 28px 24px;">
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${name}</strong> 👋, te preparamos un flujo directo para que entres, configures en segundos y veas tu dinero cuadrado:</p>

        <!-- Paso 1 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #131f37; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 16px;">
          <tr>
            <td style="padding: 18px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top; width: 34px;">
                    <div style="background-color: #3b82f620; border: 1px solid #3b82f650; color: #60a5fa; font-weight: 800; font-size: 12px; width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 8px;">1</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 8px;">
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">Clasifica tus gastos pendientes en 1 clic</div>
                    <p style="margin: 4px 0 12px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">Entra a la nueva <strong>Bandeja de Categorización</strong> con buscador en vivo. Organiza tus movimientos del Banco Popular, Banreservas, BHD o Qik sin formularios tediosos.</p>
                    <a href="${escapeHtml(`${appUrl}/app/control?view=categories`)}" style="display: inline-block; font-size: 12px; font-weight: 700; color: #38bdf8; text-decoration: none;">Ir a clasificar movimientos &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Paso 2 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #131f37; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 16px;">
          <tr>
            <td style="padding: 18px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top; width: 34px;">
                    <div style="background-color: #8b5cf620; border: 1px solid #8b5cf650; color: #a78bfa; font-weight: 800; font-size: 12px; width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 8px;">2</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 8px;">
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">Vincula tus pagos a tus Gastos Fijos</div>
                    <p style="margin: 4px 0 12px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">Asocia tus cobros reales de luz, internet, suscripciones o préstamos a tu <strong>Radar Fijo</strong>. Así sabes exactamente qué ya pagaste y qué falta de la quincena.</p>
                    <a href="${escapeHtml(`${appUrl}/app/control?view=budget&tab=recurring`)}" style="display: inline-block; font-size: 12px; font-weight: 700; color: #a78bfa; text-decoration: none;">Revisar gastos fijos &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Paso 3 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #131f37; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 20px;">
          <tr>
            <td style="padding: 18px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top; width: 34px;">
                    <div style="background-color: #10b98120; border: 1px solid #10b98150; color: #34d399; font-weight: 800; font-size: 12px; width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 8px;">3</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 8px;">
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">Consulta tu Margen Seguro Diario</div>
                    <p style="margin: 4px 0 12px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">El número mágico: una vez tus fijos están apartados, Cuadre te dice exactamente <strong>cuánto dinero puedes gastar hoy</strong> con tranquilidad y sin quedarte en olla.</p>
                    <a href="${escapeHtml(`${appUrl}/app`)}" style="display: inline-block; font-size: 12px; font-weight: 700; color: #34d399; text-decoration: none;">Ver mi Margen de hoy &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Featured Feature: Modo Coro -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #132438 0%, #171d33 100%); border-radius: 14px; border: 1px solid #38bdf840; margin-bottom: 24px;">
          <tr>
            <td style="padding: 20px;">
              <div style="display: inline-block; background-color: #38bdf820; border: 1px solid #38bdf860; color: #38bdf8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; padding: 2px 8px; border-radius: 6px; margin-bottom: 8px;">Nuevo • Función Estrella 🍻</div>
              <div style="font-size: 16px; font-weight: 800; color: #ffffff;">Modo Coro: divide cuentas sin que nadie baje la app</div>
              <p style="margin: 6px 0 14px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">¿Salida a cenar, fin de semana fuera o regalo grupal? Agrega los gastos, calcula quién le debe a quién al centavo y comparte el desglose por WhatsApp con tus cuentas bancarias para que te transfieran de una vez.</p>
              <a href="${escapeHtml(`${appUrl}/app/coro`)}" style="display: inline-block; background-color: #1e293b; border: 1px solid #475569; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 8px;">Probar Modo Coro &rarr;</a>
            </td>
          </tr>
        </table>

        <!-- Hero CTA Button -->
        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="${escapeHtml(`${appUrl}/app`)}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">Entrar a Cuadre y Organizarme</a>
        </div>
        <p style="text-align: center; margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Toma menos de 3 minutos dejar todo al día.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.6;">
        ${footer.html}
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Tu dinero, ahora más claro y sin enredos • Cuadre`,
    `Hola ${input.userDisplayName ? input.userDisplayName.split(' ')[0] : 'ahorrador'},`,
    `Hemos renovado Cuadre para que no pierdas tiempo. Sigue esta ruta de 3 pasos:`,
    `1. Clasifica tus gastos pendientes en 1 clic:`,
    `   Entra a la Bandeja de Categorización con buscador en vivo: ${appUrl}/app/control?view=categories`,
    `2. Vincula tus pagos a tus Gastos Fijos:`,
    `   Asocia tus pagos de luz, internet y suscripciones a tu Radar: ${appUrl}/app/control?view=budget&tab=recurring`,
    `3. Consulta tu Margen Seguro Diario:`,
    `   Descubre cuánto dinero puedes gastar hoy sin descuadrar el mes: ${appUrl}/app`,
    `Novedad Estrella: Modo Coro 🍻`,
    `Divide gastos en salidas o viajes y comparte por WhatsApp con tus cuentas de banco: ${appUrl}/app/coro`,
    `Entrar a Cuadre: ${appUrl}/app`,
    footer.text,
  ].filter(Boolean).join('\n\n');

  return { subject, html, text };
}
