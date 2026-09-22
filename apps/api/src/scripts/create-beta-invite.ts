import { appContainer } from '../app-container';
import { prisma } from '../config/database';

const usage = `Usage:
  npm run beta:invite -- user@example.com
  npm run beta:invite -- user@example.com --no-email
  npm run beta:invite -- user@example.com --resend
  npm run beta:invite -- --waitlist 25
  npm run beta:invite:prod -- --waitlist 25`;

async function main() {
  const rawArgs = process.argv.slice(2);
  const isProd = rawArgs.includes('--prod');
  const isDev = rawArgs.includes('--dev');
  const args = rawArgs.filter((a) => a !== '--prod' && a !== '--dev');

  console.log(`\n🚀 Modo de Entorno: ${isProd ? 'PRODUCCIÓN (app.cuadre.com.do)' : 'DESARROLLO / STAGING (localhost)'}\n`);

  if (isProd || (!isDev && (!args.includes('--no-email') || args.includes('--waitlist')))) {
    if (isProd || appContainer.betaInviteService.getAppUrl().includes('localhost')) {
      appContainer.betaInviteService.setAppUrl('https://app.cuadre.com.do');
    }
  }

  const waitlistAt = args.indexOf('--waitlist');
  if (waitlistAt >= 0) {
    if (args.includes('--resend') || args.includes('--no-email') || args.length !== 2) throw new Error(usage);
    const limit = Number(args[waitlistAt + 1]);
    const result = await appContainer.betaInviteService.inviteBatchFromWaitlist(limit);
    console.table(result.results.map((item) => ({
      email: item.email,
      estado: item.delivery?.status || 'NO_ENCOLADO',
      modo: item.delivery?.deliveryMode || '—',
      aceptado: item.firstAttemptAccepted ? 'sí' : 'no',
    })));
    for (const item of result.results) {
      if (item.activationUrl) {
        console.log(`Activation URL (${item.email}): ${item.activationUrl}`);
      }
    }
    console.log(`Seleccionados: ${result.selected}; aceptados: ${result.accepted}; sin aceptar: ${result.failed}.`);
    if (result.failed > 0) process.exitCode = 1;
    return;
  }

  const email = args[0];
  const noEmail = args.includes('--no-email');
  const forceResend = args.includes('--resend');
  if (!email || email.startsWith('--') || args.some((arg, index) => index > 0 && !['--no-email', '--resend'].includes(arg))
    || (noEmail && forceResend)) throw new Error(usage);

  const result = await appContainer.betaInviteService.inviteUser({ email, sendEmail: !noEmail, forceResend });
  if (result.used) {
    console.log(`Invite already activated: ${result.email}`);
    return;
  }
  if (noEmail) {
    console.log(`Invite ready: ${result.email}`);
    console.log(`Activation URL: ${result.activationUrl}`);
    return;
  }
  console.log(`Invite: ${result.email}`);
  console.log(`Delivery status: ${result.delivery?.status || 'NOT_QUEUED'}`);
  console.log(`Delivery mode: ${result.delivery?.deliveryMode || '—'}`);
  if (result.delivery?.providerMessageId) console.log(`Provider message: ${result.delivery.providerMessageId}`);
  if (!result.firstAttemptAccepted) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Could not create beta invite.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
