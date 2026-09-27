import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../config/database';
import { config } from '../config';
import { EmailTransportService } from '../modules/proactivity/infrastructure/email-transport.service';
import { buildBetaReminderEmail } from '../modules/auth/domain/beta-reminder-template';

interface CliOptions {
  to?: string;
  prod: boolean;
  dryRun: boolean;
  previewOnly: boolean;
  appUrl: string;
}

function parseArgs(): CliOptions {
  const rawArgs = process.argv.slice(2);
  const prod = rawArgs.includes('--prod');
  const dryRun = rawArgs.includes('--dry-run');
  const previewOnly = rawArgs.includes('--preview-only');
  const toIndex = rawArgs.indexOf('--to');
  const to = toIndex >= 0 ? rawArgs[toIndex + 1] : undefined;
  const appUrl = prod ? 'https://app.cuadre.com.do' : (config.appUrl || 'http://localhost:3000');
  return { to, prod, dryRun, previewOnly, appUrl };
}

function newCode() {
  return crypto.randomBytes(32).toString('base64url');
}

async function generateHtmlPreview(appUrl: string) {
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const { html, subject } = buildBetaReminderEmail({
    activationUrl: `${appUrl}/login?invite=sample_code_preview_123`,
    appUrl,
    trialDays: 30,
    expiresAt,
  });
  const artifactDir = path.resolve(process.cwd(), '../../.gemini/antigravity/brain/63654655-a1e7-4c1c-aab2-f1b5d273afdd');
  const outputPath = fs.existsSync(artifactDir)
    ? path.join(artifactDir, 'beta_reminder_preview.html')
    : path.join(process.cwd(), 'beta_reminder_preview.html');

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`\n📄 Vista previa HTML generada:\n   ${outputPath}\n   Asunto: "${subject}"\n`);
  return outputPath;
}

async function getUnactivatedRecipients(specificTo?: string) {
  if (specificTo) {
    return [{ email: specificTo.trim().toLowerCase() }];
  }

  const [interests, invites, profiles] = await Promise.all([
    prisma.betaInterest.findMany({ select: { email: true } }),
    prisma.betaInvite.findMany({ select: { email: true, usedAt: true } }),
    prisma.profile.findMany({ select: { email: true } }),
  ]);

  const profileEmails = new Set(profiles.map((p) => p.email.toLowerCase()));
  const activatedEmails = new Set(
    invites.filter((i) => Boolean(i.usedAt)).map((i) => i.email.toLowerCase())
  );

  const candidates = new Set<string>();
  for (const i of interests) candidates.add(i.email.toLowerCase());
  for (const inv of invites) {
    if (!inv.usedAt) candidates.add(inv.email.toLowerCase());
  }

  // Filter out any user who has an active profile, already activated, or has invalid typo email
  const unactivated: Array<{ email: string }> = [];
  for (const email of candidates) {
    if (profileEmails.has(email) || activatedEmails.has(email)) continue;
    if (email.endsWith('@gmal.com')) continue; // Ignore known typo
    unactivated.push({ email });
  }

  return unactivated;
}

async function main() {
  const opts = parseArgs();
  console.log(`\n⏰ Cuadre • Recordatorio de Activación a Usuarios de la Lista de Espera`);
  console.log(`   Modo: ${opts.prod ? 'PRODUCCIÓN (app.cuadre.com.do)' : 'DESARROLLO / LOCAL'}`);
  console.log(`   App URL base: ${opts.appUrl}`);

  if (opts.previewOnly) {
    await generateHtmlPreview(opts.appUrl);
    return;
  }

  const recipients = await getUnactivatedRecipients(opts.to);
  const now = new Date();
  const renewalExpiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  console.log(`\nUsuarios identificados para recordatorio: ${recipients.length}`);
  if (opts.dryRun) {
    console.table(recipients.map((r) => ({
      email: r.email,
      nuevoVencimiento: renewalExpiresAt.toISOString().slice(0, 10),
      diasPrueba: 30,
    })));
    console.log('\n[Dry Run] No se enviaron correos ni se renovaron códigos.');
    return;
  }

  const transport = new EmailTransportService();
  const results: Array<{ email: string; status: string; id?: string; vence?: string }> = [];

  for (const r of recipients) {
    const code = newCode();
    await prisma.betaInvite.upsert({
      where: { email: r.email },
      update: {
        code,
        expiresAt: renewalExpiresAt,
        trialDays: 30,
      },
      create: {
        email: r.email,
        code,
        expiresAt: renewalExpiresAt,
        trialDays: 30,
        source: 'WAITLIST_REMINDER',
      },
    });

    const activationUrl = `${opts.appUrl}/login?invite=${encodeURIComponent(code)}`;
    const { subject, html, text } = buildBetaReminderEmail({
      activationUrl,
      appUrl: opts.appUrl,
      trialDays: 30,
      expiresAt: renewalExpiresAt,
      recipientEmail: r.email,
    });

    try {
      const res = await transport.sendEmail({
        recipient: r.email,
        subject,
        html,
        text,
        idempotencyKey: `beta-reminder/${r.email}/${now.toISOString().slice(0, 10)}`,
      });
      results.push({
        email: r.email,
        status: res.mode,
        id: res.providerMessageId,
        vence: renewalExpiresAt.toISOString().slice(0, 10),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ email: r.email, status: `ERROR: ${msg}` });
    }
  }

  console.table(results);
}

main().catch((err) => {
  console.error('Error fatal al ejecutar script de recordatorios:', err);
  process.exit(1);
});
