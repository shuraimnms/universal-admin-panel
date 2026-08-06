export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCrossrefXML } from '@/lib/crossref/xml-generator';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paperId = searchParams.get('paperId');

    if (!paperId) {
      return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
    }

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { 
        site: true,
        paperAuthors: {
          include: { user: true },
          orderBy: { authorOrder: 'asc' }
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

    if (!settings || !journalSettings) {
      return NextResponse.json({ error: 'Crossref or Journal settings are incomplete' }, { status: 400 });
    }

    const xml = generateCrossrefXML(paper, settings, journalSettings);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      }
    });
  } catch (error: any) {
    console.error('Crossref xml preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
