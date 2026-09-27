const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
if (process.argv.includes('--prod') && fs.existsSync(path.resolve(__dirname, '../.env.production'))) {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production'), override: true });
  console.log('Targeting PRODUCTION database...');
} else {
  console.log('Targeting default/development database...');
}

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log('Enabling RLS on all Supabase tables in public schema...');

  const result = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `;

  const tables = result.map((r) => r.tablename);

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
  }

  // Revoke public privileges
  for (const role of ['anon', 'authenticated']) {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
            EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE "${table}" FROM ${role};';
          END IF;
        END $$;
      `);
    }
  }

  console.log(`\n🛡️ ¡RLS ACTIVADO Y ACCESO PÚBLICO BLOQUEADO EN LAS ${tables.length} TABLAS!`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
