const path = require('path');
const { PrismaClient } = require('@prisma/client');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });
} catch {}

// Connection URL from .env.production
const PROD_URL =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.PROD_DATABASE_URL ||
  'postgresql://postgres.cnedhjfwaxtbvszqgqcb:billsPasswordSecur@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_URL,
    },
  },
});

function getTargetEmail() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith('--email='));
  if (emailArg) return emailArg.slice('--email='.length).trim().toLowerCase();
  const plainArg = args.find((a) => !a.startsWith('--') && a.includes('@'));
  if (plainArg) return plainArg.trim().toLowerCase();
  return 'hidalgobeltreadrian@gmail.com';
}

async function main() {
  const targetEmail = getTargetEmail();
  console.log(`\n======================================================`);
  console.log(`🧹 RESET DE USUARIO EN PRODUCCIÓN (bills-prod)`);
  console.log(`🎯 Objetivo: ${targetEmail}`);
  console.log(`======================================================\n`);

  // 1. Perfil y Workspaces
  const profile = await prisma.profile.findUnique({
    where: { email: targetEmail },
    include: { memberships: true },
  });

  if (profile) {
    const workspaceIds = profile.memberships.map((m) => m.workspaceId);
    console.log(`👤 Perfil encontrado (ID: ${profile.id})`);
    console.log(`🏢 Workspaces asociados: ${workspaceIds.length ? workspaceIds.join(', ') : 'Ninguno'}`);

    for (const wsId of workspaceIds) {
      await prisma.$executeRawUnsafe(`DELETE FROM "email_deliveries" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "email_notification_preferences" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "payday_ritual_reviews" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "product_events" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "recurring_scan_jobs" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(
        `DELETE FROM "recurring_alerts" WHERE "recurring_bill_id" IN (SELECT "id" FROM "recurring_bills" WHERE "workspace_id" = $1::uuid);`,
        wsId
      );
      await prisma.$executeRawUnsafe(
        `DELETE FROM "recurring_occurrences" WHERE "recurring_bill_id" IN (SELECT "id" FROM "recurring_bills" WHERE "workspace_id" = $1::uuid);`,
        wsId
      );
      const recurring = await prisma.$executeRawUnsafe(`DELETE FROM "recurring_bills" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "income_streams" WHERE "workspace_id" = $1::uuid;`, wsId);
      const limits = await prisma.$executeRawUnsafe(`DELETE FROM "spending_budget_limits" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "rule_applications" WHERE "workspace_id" = $1::uuid;`, wsId);
      const rules = await prisma.$executeRawUnsafe(`DELETE FROM "category_rules" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "transaction_status_events" WHERE "workspace_id" = $1::uuid;`, wsId);
      const txs = await prisma.$executeRawUnsafe(`DELETE FROM "transactions" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "ingestion_jobs" WHERE "workspace_id" = $1::uuid;`, wsId);
      const events = await prisma.$executeRawUnsafe(`DELETE FROM "ingestion_events" WHERE "workspace_id" = $1::uuid;`, wsId);
      const subs = await prisma.$executeRawUnsafe(
        `DELETE FROM "inbox_institution_subscriptions" WHERE "inbox_connection_id" IN (SELECT "id" FROM "inbox_connections" WHERE "workspace_id" = $1::uuid);`,
        wsId
      );
      await prisma.$executeRawUnsafe(
        `DELETE FROM "integration_consents" WHERE "inbox_connection_id" IN (SELECT "id" FROM "inbox_connections" WHERE "workspace_id" = $1::uuid);`,
        wsId
      );
      const conns = await prisma.$executeRawUnsafe(`DELETE FROM "inbox_connections" WHERE "workspace_id" = $1::uuid;`, wsId);
      await prisma.$executeRawUnsafe(`DELETE FROM "oauth_states" WHERE "workspace_id" = $1::uuid;`, wsId);
      const members = await prisma.$executeRawUnsafe(`DELETE FROM "workspace_members" WHERE "workspace_id" = $1::uuid;`, wsId);
      const ws = await prisma.$executeRawUnsafe(`DELETE FROM "workspaces" WHERE "id" = $1::uuid;`, wsId);

      console.log(`✔ Workspace ${wsId} limpiado (Transacciones: ${txs}, Conexiones: ${conns}, Subscripciones: ${subs}, Reglas: ${rules})`);
    }

    await prisma.$executeRawUnsafe(`DELETE FROM "integration_consents" WHERE "profile_id" = $1::uuid;`, profile.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "oauth_states" WHERE "profile_id" = $1::uuid;`, profile.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "product_events" WHERE "profile_id" = $1::uuid;`, profile.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "payday_ritual_reviews" WHERE "profile_id" = $1::uuid;`, profile.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "email_deliveries" WHERE "profile_id" = $1::uuid;`, profile.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "email_notification_preferences" WHERE "profile_id" = $1::uuid;`, profile.id);
    const legal = await prisma.$executeRawUnsafe(`DELETE FROM "legal_acceptances" WHERE "profile_id" = $1::uuid;`, profile.id);
    const prof = await prisma.$executeRawUnsafe(`DELETE FROM "profiles" WHERE "id" = $1::uuid;`, profile.id);
    console.log(`✔ Perfil eliminado (Aceptaciones legales: ${legal})`);
  } else {
    console.log(`ℹ No se encontró ningún perfil en la base de datos para ${targetEmail}.`);
  }

  // 2. Invitaciones y lista de espera
  const invites = await prisma.$executeRawUnsafe(`DELETE FROM "beta_invites" WHERE "email" = $1;`, targetEmail);
  const interests = await prisma.$executeRawUnsafe(`DELETE FROM "beta_interests" WHERE "email" = $1;`, targetEmail);
  console.log(`✔ Registros de acceso eliminados (beta_invites: ${invites}, beta_interests: ${interests})`);

  // 3. Supabase Auth (auth.users)
  try {
    const authUsers = await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email = $1;`, targetEmail);
    console.log(`✔ Usuario eliminado de Supabase Auth (auth.users: ${authUsers} filas)`);
  } catch (err) {
    console.log(`ℹ Nota en Supabase Auth: ${err.message}`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ¡Cuenta ${targetEmail} completamente reseteada a CERO!`);
  console.log(`Ahora puedes volver a entrar como si fueras un usuario nuevo.`);
  console.log(`======================================================\n`);
}

main()
  .catch((err) => {
    console.error('❌ Error ejecutando reset:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
