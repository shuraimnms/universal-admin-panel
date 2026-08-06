const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin%40va-ra12@db.kkecypefhdwioqejjvof.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Connection successful! Found user:", user?.email);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
