require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { PrismaClient } = require('@prisma/client');
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DIRECT_URL o DATABASE_URL requerida en el entorno');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  const users = await prisma.$queryRawUnsafe('SELECT id, email, created_at FROM auth.users;');
  console.log('auth.users count:', users.length);
  console.log(users);

  const profiles = await prisma.profile.findMany();
  console.log('\nprofiles count:', profiles.length);
  console.log(profiles);

  const members = await prisma.workspaceMember.findMany({ include: { workspace: true } });
  console.log('\nworkspace members count:', members.length);
  console.log(members);

  await prisma.$disconnect();
}

main().catch(console.error);
