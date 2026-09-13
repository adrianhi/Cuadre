const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  const targetEmail = 'hidalgobeltreadrian@gmail.com';
  console.log(`Aplicando Soft Reset de onboarding para: ${targetEmail}...`);

  const updated = await prisma.profile.update({
    where: { email: targetEmail },
    data: {
      onboardingCompletedAt: null,
      productGuideVersionSeen: null,
      productGuideCompletedVersion: null,
      productGuideCompletedAt: null,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      onboardingCompletedAt: true,
      productGuideVersionSeen: true,
    },
  });

  console.log('✔ Perfil actualizado con éxito:', JSON.stringify(updated, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Error al actualizar perfil:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
