const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@va-ra.com';

  const user = await prisma.user.update({
    where: { email },
    data: {
      role: 'ADMIN', // The AdminShell explicitly checks for 'ADMIN'
    },
  });

  console.log('User role updated to ADMIN:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
