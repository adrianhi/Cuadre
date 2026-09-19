import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOgImage() {
  const outputPath = path.resolve(__dirname, '../apps/landing/public/og-image.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1200px;
      height: 630px;
      background: #020617;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #f8fafc;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 60px 70px;
    }

    /* Ambient background lighting */
    .glow-top {
      position: absolute;
      top: -120px;
      left: 200px;
      width: 600px;
      height: 400px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(2, 6, 23, 0) 70%);
      pointer-events: none;
    }

    .glow-bottom {
      position: absolute;
      bottom: -150px;
      right: 100px;
      width: 500px;
      height: 450px;
      background: radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, rgba(2, 6, 23, 0) 70%);
      pointer-events: none;
    }

    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 28px 28px;
      opacity: 0.7;
      pointer-events: none;
    }

    /* Left Column */
    .left-col {
      position: relative;
      z-index: 10;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10b981, #14b8a6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 28px;
      color: #020617;
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
    }

    .brand-name {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #ffffff;
    }

    .brand-badge {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 13px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .headline {
      font-size: 44px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #ffffff;
    }

    .headline-highlight {
      background: linear-gradient(90deg, #34d399, #2dd4bf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 19px;
      line-height: 1.5;
      color: #94a3b8;
      font-weight: 500;
    }

    .banks-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      font-weight: 700;
    }

    .bank-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .bank-badge {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(51, 65, 85, 0.8);
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bank-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-popular { background: #0070ba; }
    .dot-bhd { background: #00a650; }
    .dot-banreservas { background: #0033a0; }
    .dot-qik { background: #8b5cf6; }

    /* Right Column: Card Widget */
    .right-col {
      position: relative;
      z-index: 10;
    }

    .widget-card {
      width: 380px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(51, 65, 85, 0.9);
      border-radius: 28px;
      padding: 32px;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -5px rgba(16, 185, 129, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      text-align: center;
    }

    .widget-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      border-bottom: 1px solid rgba(51, 65, 85, 0.6);
      padding-bottom: 14px;
    }

    .widget-tag {
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .circle-meter {
      position: relative;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background: conic-gradient(#10b981 0% 68%, rgba(51, 65, 85, 0.5) 68% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.25);
    }

    .circle-inner {
      width: 144px;
      height: 144px;
      border-radius: 50%;
      background: #020617;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .circle-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 700;
    }

    .circle-amount {
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .circle-sub {
      font-size: 11px;
      color: #34d399;
      font-weight: 600;
    }

    .widget-footer {
      width: 100%;
      background: rgba(2, 6, 23, 0.6);
      border-radius: 14px;
      padding: 12px 14px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .security-badge {
      position: absolute;
      bottom: 24px;
      right: 32px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .domain-tag {
      font-weight: 800;
      color: #34d399;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>

  <div class="left-col">
    <div class="brand-row">
      <div class="brand-icon">C.</div>
      <span class="brand-name">Cuadre</span>
      <span class="brand-badge">República Dominicana</span>
    </div>

    <h1 class="headline">
      ¿Cuánto puedes gastar hoy <br>
      <span class="headline-highlight">sin descuadrar tu quincena?</span>
    </h1>

    <p class="subtitle">
      Control inteligente de tus gastos quincenales a partir de los avisos de tus bancos dominicanos vía Gmail.
    </p>

    <div>
      <div class="banks-label" style="margin-bottom: 8px;">Bancos Dominicanos Compatibles</div>
      <div class="bank-badges">
        <div class="bank-badge"><span class="bank-dot dot-bhd"></span> Banco BHD</div>
        <div class="bank-badge"><span class="bank-dot dot-popular"></span> Banco Popular</div>
        <div class="bank-badge"><span class="bank-dot dot-banreservas"></span> Banreservas</div>
        <div class="bank-badge"><span class="bank-dot dot-qik"></span> Qik Banco Digital</div>
      </div>
    </div>
  </div>

  <div class="right-col">
    <div class="widget-card">
      <div class="widget-header">
        <span class="widget-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Margen Seguro Diario
        </span>
        <span>12 días restantes</span>
      </div>

      <div class="circle-meter">
        <div class="circle-inner">
          <span class="circle-label">Puedes gastar</span>
          <span class="circle-amount">RD$ 1,500</span>
          <span class="circle-sub">hoy con calma</span>
        </div>
      </div>

      <div class="widget-footer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Lectura oficial vía Gmail · Sin contraseñas bancarias · Sin mover fondos</span>
      </div>
    </div>
  </div>

  <div class="security-badge">
    <span>Plataforma oficial:</span>
    <span class="domain-tag">cuadre.com.do</span>
  </div>
</body>
</html>
  `;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // 2x retina clarity
  });

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();

  console.log(`✔ OpenGraph image generated successfully at: ${outputPath}`);
}

generateOgImage().catch((err) => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
