const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Cargar explícitamente entorno de DESARROLLO (nunca .env.production)
dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEV_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!DEV_URL) {
  throw new Error('DIRECT_URL o DATABASE_URL requerida en apps/api/.env o .env');
}

const prisma = new PrismaClient({
  datasources: { db: { url: DEV_URL } },
});

function getTargetEmail() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith('--email='));
  if (emailArg) return emailArg.slice('--email='.length).trim().toLowerCase();
  const plainArg = args.find((a) => !a.startsWith('--') && a.includes('@'));
  if (plainArg) return plainArg.trim().toLowerCase();
  return 'hidalgobeltreadrian@gmail.com';
}

function extractHost(connectionUrl) {
  try {
    const url = new URL(connectionUrl.replace(/^postgresql:\/\//, 'http://'));
    return `${url.hostname} (${url.username.split('.')[1] || 'dev'})`;
  } catch {
    return 'local/dev';
  }
}

async function main() {
  const targetEmail = getTargetEmail();
  console.log(`\n======================================================`);
  console.log(`🧹 RESET DE USUARIO EN DESARROLLO (bills-dev)`);
  console.log(`🎯 Objetivo: ${targetEmail}`);
  console.log(`🗄️  Base de Datos: ${extractHost(DEV_URL)}`);
  console.log(`======================================================\n`);

  const profile = await prisma.profile.findUnique({
    where: { email: targetEmail },
    include: { memberships: true },
  });

  if (!profile) {
    console.log(`ℹ No se encontró ningún perfil con el correo ${targetEmail} en desarrollo.`);
    console.log(`🎉 La cuenta ya está limpia y lista para registrarse como nueva.`);
    return;
  }

  const workspaceIds = profile.memberships.map((m) => m.workspaceId);
  console.log(`👤 Perfil encontrado (ID: ${profile.id})`);
  console.log(`🏢 Workspaces asociados: ${workspaceIds.length ? workspaceIds.join(', ') : 'Ninguno'}`);

  for (const wsId of workspaceIds) {
    // 1. Notificaciones y eventos
    await prisma.$executeRawUnsafe(`DELETE FROM "email_deliveries" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "email_notification_preferences" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "payday_ritual_reviews" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "product_events" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 2. Gastos fijos y alertas
    await prisma.$executeRawUnsafe(`DELETE FROM "recurring_scan_jobs" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(
      `DELETE FROM "recurring_alerts" WHERE "recurring_bill_id" IN (SELECT "id" FROM "recurring_bills" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "recurring_occurrences" WHERE "recurring_bill_id" IN (SELECT "id" FROM "recurring_bills" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(`DELETE FROM "recurring_bills" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 3. Modo Coro (eliminación ordenada respetando RESTRICT en participants)
    await prisma.$executeRawUnsafe(
      `DELETE FROM "coro_expense_splits" WHERE "expense_id" IN (SELECT "id" FROM "coro_expenses" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid));`,
      wsId
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "coro_expense_payers" WHERE "expense_id" IN (SELECT "id" FROM "coro_expenses" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid));`,
      wsId
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "coroSettlements" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid);`,
      wsId
    ).catch(() => prisma.$executeRawUnsafe(
      `DELETE FROM "coro_settlements" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid);`,
      wsId
    ));
    await prisma.$executeRawUnsafe(
      `DELETE FROM "coro_expenses" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "coro_participants" WHERE "coro_group_id" IN (SELECT "id" FROM "coro_groups" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(`DELETE FROM "coro_groups" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 4. Tarjetas de crédito, categorías personalizadas e ingresos
    await prisma.$executeRawUnsafe(`DELETE FROM "credit_cards" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "workspace_categories" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "income_streams" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "spending_budget_limits" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 5. Reglas y transacciones
    await prisma.$executeRawUnsafe(`DELETE FROM "rule_applications" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "category_rules" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "transaction_status_events" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "transactions" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 6. Conexiones e ingesta
    await prisma.$executeRawUnsafe(`DELETE FROM "ingestion_jobs" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "ingestion_events" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(
      `DELETE FROM "inbox_institution_subscriptions" WHERE "inbox_connection_id" IN (SELECT "id" FROM "inbox_connections" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM "integration_consents" WHERE "inbox_connection_id" IN (SELECT "id" FROM "inbox_connections" WHERE "workspace_id" = $1::uuid);`,
      wsId
    );
    await prisma.$executeRawUnsafe(`DELETE FROM "inbox_connections" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "oauth_states" WHERE "workspace_id" = $1::uuid;`, wsId);

    // 7. Miembros y Workspace
    await prisma.$executeRawUnsafe(`DELETE FROM "workspace_members" WHERE "workspace_id" = $1::uuid;`, wsId);
    await prisma.$executeRawUnsafe(`DELETE FROM "workspaces" WHERE "id" = $1::uuid;`, wsId);

    console.log(`✔ Workspace ${wsId} limpiado por completo.`);
  }

  // 8. Limpiar datos directos del perfil
  await prisma.$executeRawUnsafe(`DELETE FROM "integration_consents" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "oauth_states" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "product_events" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "payday_ritual_reviews" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "email_deliveries" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "email_notification_preferences" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "legal_acceptances" WHERE "profile_id" = $1::uuid;`, profile.id);
  await prisma.$executeRawUnsafe(`DELETE FROM "profiles" WHERE "id" = $1::uuid;`, profile.id);

  console.log(`✔ Perfil de ${targetEmail} eliminado exitosamente.`);
  console.log(`\n🎉 ¡Cuenta ${targetEmail} completamente reseteada a CERO en Desarrollo!`);
  console.log(`👉 Puedes recargar http://localhost:5173 e iniciar sesión para vivir el onboarding desde cero.\n`);
}

main()
  .catch((err) => {
    console.error('❌ Error ejecutando reset:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
