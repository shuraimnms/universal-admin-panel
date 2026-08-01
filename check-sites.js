const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  const sites = await prisma.site.findMany();
  console.log(sites);
  if (sites.length === 0) {
    console.log("No sites found. Creating IJARCM site...");
    await prisma.site.create({
      data: {
        name: "International Journal of Academic Research in Commerce & Management",
        abbreviation: "IJARCM",
        domain: "ijarcm.com"
      }
    });
    console.log("Created IJARCM site.");
  }
} 

main().finally(() => prisma.$disconnect());
