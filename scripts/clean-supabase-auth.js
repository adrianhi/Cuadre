require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { PrismaClient } = require('@prisma/client');
const prodDirectUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!prodDirectUrl) throw new Error('DIRECT_URL o DATABASE_URL requerida en el entorno');
const prisma = new PrismaClient({ datasources: { db: { url: prodDirectUrl } } });

async function main() {
  try {
    await prisma.$executeRawUnsafe('DELETE FROM auth.users;');
    console.log('✔ auth.users wiped successfully.');
  } catch (e) {
    console.log('ℹ auth.users cleanup note:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
