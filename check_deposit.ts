import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const pendingDeposits = await prisma.crossrefDeposit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(pendingDeposits, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
