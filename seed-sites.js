const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

const sites = [
  { name: "Asian Journal of Applied Management and Science", abbreviation: "AJOAMS", domain: "ajoams.com" },
  { name: "Asian Journal of Management and Information Technology", abbreviation: "AJOMAIT", domain: "ajomait.com" },
  { name: "European Journal of Applied Management and Social Science", abbreviation: "EJAAMSS", domain: "ejaamss.com" },
  { name: "European Journal of Artificial Intelligence and Pattern Recognition", abbreviation: "EJAIAPAR", domain: "ejauiapar.com" },
  { name: "European Journal of Finance, Finance and Business Law Studies", abbreviation: "EJFFABLS", domain: "ejffabls.com" },
  { name: "European Journal of Interdisciplinary Management and Physical Sciences", abbreviation: "EJIMAPSS", domain: "ejimapss.com" },
  { name: "European Journal of Linguistics and Information Technology", abbreviation: "EJLILGP", domain: "ejlilgp.com" },
  { name: "European Journal of Applied Science", abbreviation: "EJOAS", domain: "ejoas.com" },
  { name: "Global Journal of Computer Applications and Information", abbreviation: "GJOCAI", domain: "gjocai.com" },
  { name: "International Journal of Intellectual Property and Applied Law", abbreviation: "IJIPAL", domain: "ijipal.com" },
  { name: "International Journal of Life Science and Clinical Lab", abbreviation: "IJLSCL", domain: "ijlscl.com" },
  { name: "World Journal of Internet and Information Systems", abbreviation: "WJIIS", domain: "wjiis.com" },
  { name: "Insightonix", abbreviation: "INSIGHTONIX", domain: "insightonix.com" },
];

async function main() { 
  for (const site of sites) {
    const exists = await prisma.site.findFirst({ where: { abbreviation: site.abbreviation } });
    if (!exists) {
      console.log(`Creating site: ${site.abbreviation}`);
      await prisma.site.create({
        data: {
          name: site.name,
          abbreviation: site.abbreviation,
          domain: site.domain
        }
      });
    } else {
      console.log(`Site ${site.abbreviation} already exists.`);
    }
  }
} 

main().finally(() => prisma.$disconnect());
