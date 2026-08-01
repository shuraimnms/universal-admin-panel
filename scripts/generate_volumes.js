const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Generating issues for IJARCM from 2015 to 2026...');

  let ijarcmSite = await prisma.site.findFirst({
    where: { abbreviation: 'IJARCM' }
  });

  if (!ijarcmSite) {
    ijarcmSite = await prisma.site.create({
      data: {
        name: 'International Journal of Academic Research in Commerce & Management',
        abbreviation: 'IJARCM',
        isActive: true,
      }
    });
    console.log('Created IJARCM site with ID:', ijarcmSite.id);
  } else {
    console.log('Found IJARCM site with ID:', ijarcmSite.id);
  }

  const deleteResult = await prisma.issue.deleteMany({
    where: { siteId: ijarcmSite.id }
  });
  console.log(`Deleted ${deleteResult.count} existing IJARCM issues.`);

  const startYear = 2015;
  const endYear = 2026;
  const issuesPerYear = 12;
  let totalCreated = 0;

  for (let year = startYear; year <= endYear; year++) {
    const volumeStr = `Volume ${year - startYear + 1}`;
    
    for (let issueNum = 1; issueNum <= issuesPerYear; issueNum++) {
      const issueStr = `Issue ${issueNum}`;
      const publishDate = new Date(Date.UTC(year, issueNum - 1, 1));
      const title = `${volumeStr}, ${issueStr} (${publishDate.toLocaleString('default', { month: 'long' })} ${year})`;

      await prisma.issue.create({
        data: {
          title: title,
          volume: volumeStr,
          issueNumber: issueStr,
          year: year,
          publishDate: publishDate,
          isPublished: year < 2026 || (year === 2026 && issueNum <= 7), 
          siteId: ijarcmSite.id
        }
      });
      totalCreated++;
    }
  }

  console.log(`Successfully created ${totalCreated} issues.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
