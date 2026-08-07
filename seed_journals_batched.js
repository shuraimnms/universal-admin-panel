const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
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
  console.log("Starting DB seeding (Batched)...");

  // Create a default submitter user
  let submitter = await prisma.user.findFirst({ where: { email: 'admin@system.local' } });
  if (!submitter) {
    submitter = await prisma.user.create({
      data: {
        email: 'admin@system.local',
        firstName: 'System',
        lastName: 'Admin',
        passwordHash: 'dummy',
        role: 'ADMIN',
      }
    });
  }
  
  const issuesToInsert = [];
  const papersToInsert = [];
  const usersToInsert = [];
  const paperAuthorsToInsert = [];

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
    }

    console.log(`Preparing data for ${abbr}...`);
    // 2. Prepare Issues and Papers (Volume 1 to Volume 12, Issue 1 to 4) for this site
    // 2015 to 2026
    for (let year = 2015; year <= 2026; year++) {
      const volume = year - 2014;
      for (let issueNum = 1; issueNum <= 4; issueNum++) {
        // Skip future issues
        if (year === 2026 && issueNum > 3) continue;

        const title = `Volume ${volume}, Issue ${issueNum}`;
        const issueId = randomUUID();

        issuesToInsert.push({
          id: issueId,
          siteId: site.id,
          title: title,
          volume: volume.toString(),
          issueNumber: issueNum.toString(),
          year: year,
          isPublished: true,
          publishDate: new Date(year, (issueNum - 1) * 3, 1),
        });

        // 3. Prepare 2 Papers for each issue
        for (let p = 1; p <= 2; p++) {
          const paperTitle = `Research on Advanced Methodologies in ${abbr}: A Case Study ${volume}-${issueNum}-${p}`;
          const uniqueNumber = `${abbr.toLowerCase()}-${year}-${volume}-${issueNum}-${p}`;
          const paperId = randomUUID();
          const authorUserId = randomUUID();
          
          usersToInsert.push({
            id: authorUserId,
            email: `author_${uniqueNumber}@example.com`,
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            passwordHash: 'dummy',
            role: 'AUTHOR',
            institution: randomUni(),
          });

          papersToInsert.push({
            id: paperId,
            siteId: site.id,
            title: paperTitle,
            abstract: "This is a detailed placeholder abstract for the research paper. It explores various aspects of the topic and provides significant insights into the latest developments in the field.",
            status: "PUBLISHED",
            category: "RESEARCH_ARTICLE",
            issueId: issueId,
            issueNumber: issueNum.toString(),
            volumeNumber: volume.toString(),
            uniqueNumber: uniqueNumber,
            doi: `10.1000/${uniqueNumber}`,
            filePath: "#",
            submitterId: submitter.id,
            submittedAt: new Date(year, (issueNum - 1) * 3 - 1, 1),
            publishedAt: new Date(year, (issueNum - 1) * 3, 1),
            publicationDate: new Date(year, (issueNum - 1) * 3, 1),
          });

          paperAuthorsToInsert.push({
            id: randomUUID(),
            paperId: paperId,
            userId: authorUserId,
            authorOrder: 1,
            isCorresponding: true
          });
        }
      }
    }
  }

  console.log(`Generated ${issuesToInsert.length} issues, ${papersToInsert.length} papers in memory.`);

  try {
    console.log("Inserting users...");
    await prisma.user.createMany({ data: usersToInsert, skipDuplicates: true });
    
    console.log("Inserting issues...");
    await prisma.issue.createMany({ data: issuesToInsert, skipDuplicates: true });
    
    console.log("Inserting papers...");
    await prisma.paper.createMany({ data: papersToInsert, skipDuplicates: true });
    
    console.log("Inserting paper authors...");
    await prisma.paperAuthor.createMany({ data: paperAuthorsToInsert, skipDuplicates: true });
    
    console.log("Bulk inserts completed!");
  } catch(e) {
    console.error("Error during bulk insert:", e);
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
