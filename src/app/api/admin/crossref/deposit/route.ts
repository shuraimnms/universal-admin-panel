import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateCrossrefMetadata } from '@/lib/crossref/validator';
import { generateCrossrefXML } from '@/lib/crossref/xml-generator';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' )) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId } = await req.json();
    if (!paperId) {
      return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
    }

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { 
        site: true,
        paperAuthors: {
          include: { user: true }
        },
        paperContent: true
      }
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const settings = await prisma.crossrefSettings.findFirst();
    const journalSettings = paper.siteId 
      ? await prisma.crossrefJournalSettings.findUnique({ where: { siteId: paper.siteId } })
      : null;

    const validation = validateCrossrefMetadata(paper, settings, journalSettings);
    if (validation.status === 'ERRORS') {
      return NextResponse.json({ error: 'Validation failed', validation }, { status: 400 });
    }

    const xmlContent = generateCrossrefXML(paper, settings, journalSettings);

    const latestVersion = await prisma.crossrefXmlVersion.findFirst({
      where: { paperId: paper.id },
      orderBy: { version: 'desc' }
    });
    
    const newVersionNum = latestVersion ? latestVersion.version + 1 : 1;

    const xmlRecord = await prisma.crossrefXmlVersion.create({
      data: {
        paperId: paper.id,
        version: newVersionNum,
        xmlData: xmlContent
      }
    });

    // Create or update deposit record in queue
    const deposit = await prisma.crossrefDeposit.upsert({
      where: { paperId: paper.id },
      update: {
        status: 'WAITING',
        operatorId: session.user.id,
        submissionTime: new Date(),
        retryCount: 0, // Reset retries on manual deposit
        xmlVersionId: xmlRecord.id
      },
      create: {
        paperId: paper.id,
        siteId: paper.siteId!,
        doi: paper.doi!,
        status: 'WAITING',
        operatorId: session.user.id,
        submissionTime: new Date(),
        xmlVersionId: xmlRecord.id
      }
    });

    await prisma.crossrefLog.create({
      data: {
        depositId: deposit.id,
        action: 'QUEUED',
        status: 'SUCCESS',
        details: 'Added to deposit queue manually.',
        operatorId: session.user.id
      }
    });

    return NextResponse.json({ success: true, deposit });
  } catch (error: any) {
    console.error('Crossref deposit enqueue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
