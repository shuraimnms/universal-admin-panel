const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const siteAbbreviations = [
  'IJARCM', 'AJOAMS', 'AJOMAIT', 'EJAAMSS', 'EJAUIAPAR', 
  'EJFFABLS', 'EJIMAPSS', 'EJLILGP', 'EJOAS', 'GJOCAI', 
  'IJIPAL', 'IJLSCL', 'WJIIS', 'INSIGHTONIX'
];

// Realistic fake data generators
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Jessica', 'William', 'Elizabeth', 'Thomas', 'Jennifer', 'Richard', 'Linda', 'Charles'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const universities = ['University of Oxford', 'Harvard University', 'MIT', 'Stanford University', 'University of Cambridge', 'Caltech', 'Princeton University', 'Yale University', 'UCL', 'Imperial College London'];

function randomName() {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function randomUni() {
  return universities[Math.floor(Math.random() * universities.length)];
}

async function seed() {
  console.log("Starting DB seeding...");
  
  // 1. Ensure all sites exist
  for (const abbr of siteAbbreviations) {
    let site = await prisma.site.findFirst({
      where: { abbreviation: abbr }
    });
    
    if (!site) {
      site = await prisma.site.create({
        data: {
          name: abbr + " Journal",
          abbreviation: abbr,
          isActive: true
        }
      });
      console.log(`Created site ${abbr}`);
    } else {
      console.log(`Site ${abbr} already exists`);
    }

    // 2. Seed Issues (Volume 1 to Volume 12, Issue 1 to 4) for this site
    // 2015 to 2026
    for (let year = 2015; year <= 2026; year++) {
      const volume = year - 2014;
      for (let issueNum = 1; issueNum <= 4; issueNum++) {
        // Skip future issues
        if (year === 2026 && issueNum > 3) continue;

        const title = `Volume ${volume}, Issue ${issueNum}`;
        const isCurrent = (year === 2026 && issueNum === 3);

        let issue = await prisma.issue.findFirst({
          where: {
            siteId: site.id,
            volume: volume.toString(),
            number: issueNum.toString()
          }
        });

        if (!issue) {
          issue = await prisma.issue.create({
            data: {
              siteId: site.id,
              title: title,
              volume: volume.toString(),
              number: issueNum.toString(),
              year: year.toString(),
              isCurrent: isCurrent,
              isPublished: true,
              publishedAt: new Date(year, (issueNum - 1) * 3, 1),
            }
          });
        }

        // 3. Seed 2 Papers for each issue
        for (let p = 1; p <= 2; p++) {
          const paperTitle = `Research on Advanced Methodologies in ${abbr}: A Case Study ${volume}-${issueNum}-${p}`;
          const paperId = `${abbr.toLowerCase()}-${year}-${volume}-${issueNum}-${p}`;
          
          let paper = await prisma.paper.findFirst({
            where: {
              siteId: site.id,
              title: paperTitle
            }
          });

          if (!paper) {
            paper = await prisma.paper.create({
              data: {
                siteId: site.id,
                title: paperTitle,
                abstract: "This is a detailed placeholder abstract for the research paper. It explores various aspects of the topic and provides significant insights into the latest developments in the field.",
                paperId: paperId,
                status: "PUBLISHED",
                type: "RESEARCH_ARTICLE",
                issueId: issue.id,
                doi: `10.1000/${paperId}`,
                pdfUrl: "#",
                submittedAt: new Date(year, (issueNum - 1) * 3 - 1, 1),
                acceptedAt: new Date(year, (issueNum - 1) * 3, 1),
                publishedAt: new Date(year, (issueNum - 1) * 3, 1),
                authors: {
                  create: [
                    {
                      orderIndex: 0,
                      isCorresponding: true,
                      author: {
                        create: {
                          name: randomName(),
                          email: `author${p}@example.com`,
                          institution: randomUni(),
                          country: "United States"
                        }
                      }
                    }
                  ]
                }
              }
            });
            // Link to archive paper
            /* Not strictly necessary depending on how frontend queries, but let's add */
          }
        }
      }
    }
  }

  // Seed generic board members globally if none exist
  const existingBoard = await prisma.editorialBoardMember.count();
  if (existingBoard === 0) {
    console.log("Seeding global editorial board...");
    const roles = ['EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'MEMBER', 'ADVISORY_BOARD', 'INTERNATIONAL_BOARD_MEMBER'];
    for (const role of roles) {
      for (let i = 0; i < 3; i++) {
        await prisma.editorialBoardMember.create({
          data: {
            name: randomName(),
            institution: randomUni(),
            position: role,
            expertise: "Advanced Research, Data Science, Methodology",
            email: `board_${role}_${i}@example.com`,
            isActive: true,
            displayOrder: i
          }
        });
      }
    }
  } else {
    console.log("Editorial board already seeded.");
  }

  console.log("Seeding complete.");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
