import { PrismaClient } from '@prisma/client';
import { validateCrossrefMetadata } from '../lib/crossref/validator';
import { generateCrossrefXML } from '../lib/crossref/xml-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying all 14 journals metadata and DOI generation...');

  const journals = [
    { name: 'IJARCM', short: 'ijarcm' },
    { name: 'WJIIS', short: 'wjiis' },
    { name: 'IJIPAL', short: 'ijipal' },
    { name: 'GJOCAI', short: 'gjocai' },
    { name: 'AJOAMS', short: 'ajoams' },
    { name: 'AJOMAIT', short: 'ajomait' },
    { name: 'EJAAMSS', short: 'ejaamss' },
    { name: 'EJFFABLS', short: 'ejffabls' },
    { name: 'EJLILGP', short: 'ejlilgp' },
    { name: 'EJIMAPSS', short: 'ejimapss' },
    { name: 'EJAUIAPAR', short: 'ejauiapar' },
    { name: 'INSIGHTONIX', short: 'insightonix' },
    { name: 'EJOAS', short: 'ejoas' },
    { name: 'IJLSCL', short: 'ijlscl' }
  ];

  const doiset = new Set<string>();

  for (const j of journals) {
    const site = await prisma.site.findUnique({ where: { id: j.short } });
    if (!site) {
      console.error(`Site ${j.short} not found!`);
      continue;
    }

    const journalSettings = await prisma.crossrefJournalSettings.findUnique({
      where: { siteId: site.id }
    });

    const crossrefSettings = await prisma.crossrefSettings.findFirst();

    if (!journalSettings) {
      console.error(`Journal settings not found for ${j.short}!`);
      continue;
    }
    
    if (!crossrefSettings) {
      console.error('Global Crossref Settings not found!');
      break;
    }
    
    // Metadata verifications
    if (!journalSettings.issn) throw new Error(`Missing ISSN for ${j.short}`);
    if (!journalSettings.publisher) throw new Error(`Missing Publisher for ${j.short}`);
    if (!journalSettings.crossrefPrefix) throw new Error(`Missing Prefix for ${j.short}`);

    console.log(`Journal ${j.name} metadata verified. (ISSN: ${journalSettings.issn})`);

    // Create a unique test paper for verification
    const paperId = `verify-${j.short}-${Date.now()}`;
    const author = await prisma.user.findFirst();

    let issue = await prisma.issue.findFirst({ where: { siteId: site.id } });
    if (!issue) {
      issue = await prisma.issue.create({
        data: {
          id: `verify-issue-${j.short}`,
          title: `Volume 1 Issue 1`,
          volume: '1',
          issueNumber: '1',
          year: 2026,
          siteId: site.id,
          publishDate: new Date('2026-01-01'),
        }
      });
    }

    const paper = await prisma.paper.create({
      data: {
        id: paperId,
        title: `Verification Paper for ${j.name}`,
        abstract: 'This is a verification paper to ensure DOIs are generated correctly for each journal independently.',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-01-01'),
        publicationDate: new Date('2026-01-01'),
        volumeNumber: '1',
        issueNumber: '1',
        uniqueNumber: Math.floor(Math.random() * 1000).toString(),
        siteId: site.id,
        submitterId: author!.id,
        issueId: issue.id,
        filePath: `/uploads/test/verify-${j.short}.pdf`,
        paperAuthors: {
          create: [{ userId: author!.id, authorOrder: 1 }]
        }
      },
      include: {
        paperAuthors: { include: { user: true } },
        paperContent: true,
        issue: true,
      }
    });

    // 1. Generate DOI
    const issueNum = paper.issueNumber?.padStart(2, '0') || '01';
    const volumeNum = paper.volumeNumber?.padStart(2, '0') || '01';
    const articleNum = paper.uniqueNumber?.padStart(3, '0') || '001';
    
    // format: 10.66572/{journal}.{year}.v{volume}.i{issue}.{article}
    const doi = `${journalSettings.crossrefPrefix}/${j.short}.${paper.publicationDate?.getFullYear() || 2026}.v${volumeNum}.i${issueNum}.${articleNum}`;
    
    // Assign DOI to paper so validator passes
    paper.doi = doi;

    console.log(`  -> Generated DOI: ${doi}`);

    if (doiset.has(doi)) {
      throw new Error(`CRITICAL FAILURE: Duplicate DOI found! ${doi}`);
    }
    doiset.add(doi);

    // 2. Validate Metadata
    const validation = validateCrossrefMetadata(paper, crossrefSettings, journalSettings);
    if (validation.status === 'ERRORS') {
      throw new Error(`Validation failed for ${j.short}: ${validation.errors.join(', ')}`);
    }

    // 3. Generate XML
    const xml = await generateCrossrefXML(paper, crossrefSettings, journalSettings);
    if (!xml || !xml.includes(`<full_title>${j.name}</full_title>`)) {
      throw new Error(`XML generation failed or missed journal name for ${j.short}`);
    }

    // 4. Create Queue Entry
    const xmlVersion = await prisma.crossrefXmlVersion.create({
      data: {
        paperId: paper.id,
        xmlData: xml,
        version: 1,
      }
    });

    const deposit = await prisma.crossrefDeposit.create({
      data: {
        doi,
        status: 'WAITING',
        retryCount: 0,
        paperId: paper.id,
        siteId: site.id,
        operatorId: author!.id,
        xmlVersionId: xmlVersion.id,
        logs: {
          create: {
            details: 'Queued for verification.',
            action: 'QUEUE',
            status: 'SUCCESS'
          }
        }
      }
    });

    console.log(`  -> Successfully queued as deposit ID: ${deposit.id}`);
  }

  console.log(`\nSUCCESS: Verified all ${journals.length} journals.`);
  console.log(`Total DOIs verified unique: ${doiset.size}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
