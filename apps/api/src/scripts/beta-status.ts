import { prisma } from '../config/database';
import { PRODUCT_GUIDE_VERSION } from '@bills/contracts';
import { appContainer } from '../app-container';

async function main() {
  const isProd = process.argv.includes('--prod');
  console.log(`\n🚀 Modo de Entorno: ${isProd ? 'PRODUCCIÓN (app.cuadre.com.do)' : 'DESARROLLO / STAGING (localhost)'}\n`);

  const metrics = await appContainer.betaInviteService.getFunnelMetrics();
  console.table([{
    interesados: metrics.interestedTotal,
    pendientes: metrics.interestedPending,
    invitados: metrics.invitedTotal,
    activados: metrics.activatedTotal,
    onboarding: metrics.onboardingCompleted,
    gmailActivo: metrics.gmailConnectedUsers,
    bancosHabilitados: metrics.enabledBanks,
    emailAudit: metrics.emailAudit,
    emailAceptado: metrics.emailAccepted,
    emailEntregado: metrics.emailDelivered,
    emailPendiente: metrics.emailPending,
    emailFallido: metrics.emailFailed,
    sinCorreo: metrics.emailNotSent,
    conversión: `${metrics.conversionPercent}%`,
  }]);

  const [interests, invites] = await Promise.all([
    prisma.betaInterest.findMany({
      orderBy: { createdAt: 'asc' },
      select: { email: true, createdAt: true, source: true, campaignCode: true },
    }),
    prisma.betaInvite.findMany({
      orderBy: { createdAt: 'asc' },
      select: { email: true, createdAt: true, usedAt: true },
    }),
  ]);

  const invitedEmails = new Set(invites.map((i) => i.email));

  if (interests.length > 0) {
    console.log('\n📋 Solicitudes de Acceso / Lista de Espera (Waitlist):');
    console.table(
      interests.map((item) => ({
        email: item.email,
        solicitó: item.createdAt.toISOString().slice(0, 10),
        origen: item.source || '—',
        campaña: item.campaignCode || '—',
        estado: invitedEmails.has(item.email) ? 'INVITADO ✅' : 'PENDIENTE ⏳',
      }))
    );
  }

  console.log('\n👥 Usuarios Invitados y Estado de Actividad:');

  const rows = await Promise.all(invites.map(async (invite) => {
    const profile = await prisma.profile.findUnique({
      where: { email: invite.email },
      select: {
        onboardingCompletedAt: true,
        productGuideVersionSeen: true,
        productGuideCompletedVersion: true,
        memberships: { take: 1, orderBy: { createdAt: 'asc' }, select: { workspaceId: true } },
      },
    });
    const workspaceId = profile?.memberships[0]?.workspaceId;
    const [connections, transactionCount, failedEvents] = workspaceId
      ? await Promise.all([
          prisma.inboxConnection.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            select: {
              status: true,
              lastSuccessfulSyncAt: true,
              institutionSubscriptions: { where: { enabled: true }, select: { institutionCode: true } },
            },
          }),
          prisma.transaction.count({ where: { workspaceId } }),
          prisma.ingestionEvent.count({ where: { workspaceId, status: 'FAILED' } }),
        ])
      : [[], 0, 0] as const;
    const connection = connections[0];

    return {
      email: invite.email,
      invitado: invite.createdAt.toISOString().slice(0, 10),
      activado: invite.usedAt ? 'sí' : 'no',
      onboarding: profile?.onboardingCompletedAt ? 'completo' : profile ? 'pendiente' : 'sin registro',
      guía: profile?.productGuideCompletedVersion === PRODUCT_GUIDE_VERSION
        ? 'completa'
        : profile?.productGuideVersionSeen === PRODUCT_GUIDE_VERSION ? 'vista' : 'pendiente',
      gmail: connection?.status ?? 'SIN_CONEXIÓN',
      bancos: connection?.institutionSubscriptions.map((item) => item.institutionCode).sort().join(', ') || '—',
      últimaSincronización: connection?.lastSuccessfulSyncAt?.toISOString() ?? '—',
      movimientos: transactionCount,
      fallos: failedEvents,
    };
  }));

  if (rows.length === 0) {
    console.log('No hay invitaciones beta.');
    return;
  }
  console.table(rows);
  console.log('\nEste reporte no incluye montos, comercios, notas ni credenciales.');
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'No se pudo consultar el estado de la beta.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
