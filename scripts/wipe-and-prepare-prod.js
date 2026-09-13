const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DIRECT_URL o DATABASE_URL no definidos.');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('🔗 Conectando a Supabase Producción:', dbUrl.split('@')[1] || dbUrl);

  // 1. Mostrar recuento previo
  console.log('\n📊 Conteo previo:');
  const preProfiles = await prisma.profile.count();
  const preWorkspaces = await prisma.workspace.count();
  const preTransactions = await prisma.transaction.count();
  const preConnections = await prisma.inboxConnection.count();
  console.log(`   Profiles: ${preProfiles}, Workspaces: ${preWorkspaces}, Transactions: ${preTransactions}, Connections: ${preConnections}`);

  // 2. Limpieza completa de tablas de usuarios y datos con CASCADE
  console.log('\n🧹 Limpiando todas las tablas de usuarios, transacciones y espacios...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "transactions",
      "transaction_status_events",
      "ingestion_events",
      "ingestion_jobs",
      "inbox_institution_subscriptions",
      "bank_connections",
      "inbox_connections",
      "ingestion_addresses",
      "oauth_states",
      "integration_consents",
      "legal_acceptances",
      "workspace_members",
      "workspaces",
      "profiles",
      "beta_invites",
      "spending_budget_limits",
      "income_streams",
      "recurring_bills",
      "recurring_occurrences",
      "recurring_alerts",
      "recurring_scan_jobs",
      "payday_ritual_reviews",
      "product_events",
      "email_notification_preferences",
      "email_deliveries",
      "email_delivery_events",
      "category_rules",
      "rule_applications",
      "rule_application_items",
      "account_deletion_audits"
    CASCADE;
  `);
  console.log('   ✔ Tablas públicas de datos de usuario limpiadas con éxito.');

  // 3. Limpiar auth.users en Supabase
  console.log('\n👤 Limpiando usuarios de autenticación en Supabase (auth.users)...');
  try {
    const deletedAuth = await prisma.$executeRawUnsafe('DELETE FROM auth.users;');
    console.log(`   ✔ auth.users limpiado con éxito (${deletedAuth} eliminados).`);
  } catch (e) {
    console.log('   ℹ Nota sobre auth.users:', e.message);
  }

  // 4. Sembrar / Asegurar Instituciones Financieras
  console.log('\n🏦 Asegurando catálogo de instituciones financieras...');
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "InstitutionStatus" AS ENUM ('PILOT', 'ACTIVE', 'COMING_SOON', 'DISABLED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "financial_institutions" ("code", "display_name", "status", "sender_patterns", "updated_at") VALUES
      ('BHD', 'Banco BHD', 'PILOT', ARRAY['alertas@bhd.com.do', '@bhd.com.do'], CURRENT_TIMESTAMP),
      ('POPULAR', 'Banco Popular', 'COMING_SOON', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
      ('BANRESERVAS', 'Banreservas', 'PILOT', ARRAY['notificaciones@banreservas.com', 'notificacionestubancoapp@banreservas.com'], CURRENT_TIMESTAMP),
      ('QIK', 'Qik Banco Digital', 'PILOT', ARRAY['@qik.do', '@qik.com.do'], CURRENT_TIMESTAMP),
      ('APAP', 'APAP', 'COMING_SOON', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
      ('SCOTIABANK', 'Scotiabank', 'COMING_SOON', ARRAY[]::TEXT[], CURRENT_TIMESTAMP),
      ('CASH', 'Manual / Efectivo', 'ACTIVE', ARRAY[]::TEXT[], CURRENT_TIMESTAMP)
    ON CONFLICT ("code") DO UPDATE SET
      "display_name" = EXCLUDED."display_name",
      "status" = EXCLUDED."status",
      "sender_patterns" = EXCLUDED."sender_patterns",
      "updated_at" = CURRENT_TIMESTAMP;
  `);
  console.log('   ✔ Instituciones financieras aseguradas.');

  // 5. Sembrar / Asegurar Documentos Legales
  console.log('\n📄 Asegurando documentos legales (Términos y Privacidad)...');
  const termsHash = crypto.createHash('sha256').update('terms-2026-08-29.1').digest('hex');
  const privacyHash = crypto.createHash('sha256').update('privacy-2026-08-29.1').digest('hex');

  await prisma.$executeRawUnsafe(`
    INSERT INTO "legal_documents" ("id", "type", "version", "locale", "title", "slug", "content_hash", "is_current", "effective_at", "created_at") VALUES
      (gen_random_uuid(), 'TERMS', '2026-08-29.1', 'es-DO', 'Términos y condiciones de uso', 'terms', '${termsHash}', true, '2026-08-29 00:00:00', NOW()),
      (gen_random_uuid(), 'PRIVACY', '2026-08-29.1', 'es-DO', 'Política de privacidad', 'privacy', '${privacyHash}', true, '2026-08-29 00:00:00', NOW())
    ON CONFLICT ("type", "version", "locale") DO NOTHING;
  `);
  console.log('   ✔ Documentos legales asegurados.');

  // 6. Asegurar Row Level Security (RLS)
  console.log('\n🔒 Asegurando RLS en todas las tablas...');
  const tablesResult = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
  `;
  for (const row of tablesResult) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${row.tablename}" ENABLE ROW LEVEL SECURITY;`);
  }
  console.log(`   ✔ RLS activo en ${tablesResult.length} tablas.`);

  // 7. Conteo posterior
  console.log('\n🔍 Verificación final:');
  const postProfiles = await prisma.profile.count();
  const postWorkspaces = await prisma.workspace.count();
  const postTransactions = await prisma.transaction.count();
  const postInstitutions = await prisma.financialInstitution.count();
  const postLegal = await prisma.legalDocument.count();
  console.log(`   Profiles: ${postProfiles}, Workspaces: ${postWorkspaces}, Transactions: ${postTransactions}`);
  console.log(`   Instituciones: ${postInstitutions}, Documentos Legales: ${postLegal}`);

  console.log('\n✨ BASE DE DATOS DE PRODUCCIÓN 100% LIMPIA Y LISTA PARA ONBOARDING DESDE CERO.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
