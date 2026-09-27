import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../config/database';
import { config } from '../config';
import { EmailTransportService } from '../modules/proactivity/infrastructure/email-transport.service';
import { renderProductUpdateEmail } from '../modules/proactivity/domain/product-update-template';

interface CliOptions {
  to?: string;
  allActive: boolean;
  prod: boolean;
  dryRun: boolean;
  previewOnly: boolean;
  appUrl: string;
}

function parseArgs(): CliOptions {
  const rawArgs = process.argv.slice(2);
  const prod = rawArgs.includes('--prod');
  const allActive = rawArgs.includes('--all-active');
  const dryRun = rawArgs.includes('--dry-run');
  const previewOnly = rawArgs.includes('--preview-only');
  const toIndex = rawArgs.indexOf('--to');
  const to = toIndex >= 0 ? rawArgs[toIndex + 1] : undefined;
  const appUrl = prod ? 'https://app.cuadre.com.do' : (config.appUrl || 'http://localhost:3000');
  return { to, allActive, prod, dryRun, previewOnly, appUrl };
}

async function generateHtmlPreview(appUrl: string) {
  const { html, subject } = renderProductUpdateEmail({
    userDisplayName: 'Adrian Hidalgo',
    appUrl,
  });
  const artifactDir = path.resolve(process.cwd(), '../../.gemini/antigravity/brain/63654655-a1e7-4c1c-aab2-f1b5d273afdd');
  const outputPath = fs.existsSync(artifactDir)
    ? path.join(artifactDir, 'product_update_preview.html')
    : path.join(process.cwd(), 'product_update_preview.html');

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`\n📄 Vista previa HTML generada exitosamente:\n   ${outputPath}\n   Asunto: "${subject}"\n`);
  return outputPath;
}

async function main() {
  const opts = parseArgs();
  console.log(`\n📢 Cuadre • Envío de Actualización de Producto (Product Update)`);
  console.log(`   Modo: ${opts.prod ? 'PRODUCCIÓN (app.cuadre.com.do)' : 'DESARROLLO / LOCAL'}`);
  console.log(`   App URL base: ${opts.appUrl}`);

  if (opts.previewOnly || (!opts.to && !opts.allActive)) {
    await generateHtmlPreview(opts.appUrl);
    console.log(`💡 Para enviar un correo de prueba a tu email:`);
    console.log(`   npm run email:update -- --to tu_correo@gmail.com\n`);
    return;
  }

  const transport = new EmailTransportService();
  const recipients: Array<{ email: string; name?: string }> = [];

  if (opts.to) {
    recipients.push({ email: opts.to, name: opts.to.split('@')[0] });
  } else if (opts.allActive) {
    const profiles = await prisma.profile.findMany({
      select: { email: true, displayName: true },
      take: 200,
    });
    for (const p of profiles) {
      if (p.email) recipients.push({ email: p.email, name: p.displayName || undefined });
    }
  }

  console.log(`\nDestinatarios identificados: ${recipients.length}`);
  if (opts.dryRun) {
    console.table(recipients);
    console.log('\n[Dry Run] No se enviaron correos.');
    return;
  }

  const results: Array<{ email: string; status: string; id?: string }> = [];
  for (const r of recipients) {
    const { subject, html, text } = renderProductUpdateEmail({
      userDisplayName: r.name,
      appUrl: opts.appUrl,
    });
    try {
      const res = await transport.sendEmail({
        recipient: r.email,
        subject,
        html,
        text,
        idempotencyKey: `product-update/${r.email}/${new Date().toISOString().slice(0, 10)}`,
      });
      results.push({ email: r.email, status: res.mode, id: res.providerMessageId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ email: r.email, status: `ERROR: ${msg}` });
    }
  }

  console.table(results);
}

main().catch((err) => {
  console.error('Error fatal al ejecutar script de correo:', err);
  process.exit(1);
});
