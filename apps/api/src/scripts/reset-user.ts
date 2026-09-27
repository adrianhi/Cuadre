import { prisma } from '../config/database';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const email = (getArg('email') || 'hidalgobeltreadrian@gmail.com').trim().toLowerCase();
  const isFull = hasFlag('full') || hasFlag('wipe');
  const isDelete = hasFlag('delete');

  console.log(`\n🔄 Buscando usuario con email: ${email}...`);

  const profile = await prisma.profile.findUnique({
    where: { email },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!profile) {
    console.log(`❌ No se encontró ningún perfil con el correo ${email}.`);
    return;
  }

  const workspaceIds = profile.memberships.map((m) => m.workspaceId);
  console.log(`👤 Perfil encontrado: ID ${profile.id}`);
  console.log(`🏢 Espacios de trabajo asociados: ${workspaceIds.length}`);

  if (isDelete) {
    console.log('\n🗑️ Modo --delete: Eliminando perfil y workspaces completamente...');
    for (const wsId of workspaceIds) {
      await prisma.workspace.delete({ where: { id: wsId } });
    }
    await prisma.profile.delete({ where: { id: profile.id } });
    console.log('✅ Usuario y espacios eliminados de la base de datos.');
    console.log('👉 Al volver a iniciar sesión en el navegador, serás un usuario 100% nuevo desde cero.\n');
    return;
  }

  console.log('\n🧹 Limpiando datos de línea base y configuración...');

  // Reset baseline financial records
  for (const wsId of workspaceIds) {
    await prisma.monthlyBudget.deleteMany({ where: { workspaceId: wsId } });
    await prisma.incomeStream.deleteMany({ where: { workspaceId: wsId } });
    await prisma.recurringBill.deleteMany({ where: { workspaceId: wsId } });

    if (isFull) {
      console.log('🧹 Modo --full: Limpiando transacciones, tarjetas y conexiones...');
      await prisma.transaction.deleteMany({ where: { workspaceId: wsId } });
      await prisma.creditCard.deleteMany({ where: { workspaceId: wsId } });
      await prisma.categoryRule.deleteMany({ where: { workspaceId: wsId } });
      await prisma.inboxConnection.deleteMany({ where: { workspaceId: wsId } });
      await prisma.ingestionJob.deleteMany({ where: { workspaceId: wsId } });
    }
  }

  // Reset profile onboarding flags
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      onboardingCompletedAt: null,
      productGuideVersionSeen: null,
      productGuideCompletedVersion: null,
      productGuideCompletedAt: null,
    },
  });

  console.log('✅ Onboarding reiniciado:');
  console.log('   - onboardingCompletedAt: null');
  console.log('   - productGuideVersionSeen: null');
  console.log('   - Línea base borrada (ingresos, presupuestos y servicios fijos eliminados)');
  if (isFull) {
    console.log('   - Transacciones y conexiones eliminadas');
  }
  console.log('\n🎉 ¡Listo! Al refrescar la página en http://localhost:5173 entrarás directamente al Onboarding como usuario nuevo.\n');
}

main()
  .catch((err) => {
    console.error('❌ Error al resetear usuario:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
