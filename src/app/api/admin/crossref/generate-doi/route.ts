export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId } = await req.json();
    if (!paperId) {
      return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
    }

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { site: true }
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (paper.doi) {
      return NextResponse.json({ error: 'Paper already has a DOI', doi: paper.doi }, { status: 400 });
    }

    const settings = await prisma.crossrefSettings.findFirst();
    const journalSettings = paper.siteId 
      ? await prisma.crossrefJournalSettings.findUnique({ where: { siteId: paper.siteId } })
      : null;

    const prefix = settings?.doiPrefix || journalSettings?.crossrefPrefix || '10.66572';
    const journalAbbrev = journalSettings?.shortName?.toLowerCase() || paper.site?.abbreviation?.toLowerCase() || 'journal';
    const year = (paper.publicationDate || paper.publishedAt || new Date()).getFullYear();
    const volume = paper.volumeNumber ? String(paper.volumeNumber).padStart(2, '0') : '01';
    const issue = paper.issueNumber ? String(paper.issueNumber).padStart(2, '0') : '01';

    // Auto-increment article number based on existing papers in this issue
    let articleNum = 1;
    if (paper.issueId) {
      const issuePapers = await prisma.paper.count({
        where: {
          issueId: paper.issueId,
          doi: { not: null }
        }
      });
      articleNum = issuePapers + 1;
    } else {
      // Fallback: count by site and year
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
      const yearlyPapers = await prisma.paper.count({
        where: {
          siteId: paper.siteId,
          doi: { not: null },
          OR: [
            { publicationDate: { gte: yearStart, lte: yearEnd } },
            { publishedAt: { gte: yearStart, lte: yearEnd } }
          ]
        }
      });
      articleNum = yearlyPapers + 1;
    }

    // Pattern: {prefix}/{journal}.{year}.v{volume}.i{issue}.{article}
    // Ensure DOI uniqueness
    let isUnique = false;
    let finalDoi = '';
    while (!isUnique) {
      const articleStr = String(articleNum).padStart(3, '0');
      finalDoi = `${prefix}/${journalAbbrev}.${year}.v${volume}.i${issue}.${articleStr}`;
      
      const existing = await prisma.paper.findFirst({ where: { doi: finalDoi } });
      if (existing) {
        articleNum++;
      } else {
        isUnique = true;
      }
    }

    const updated = await prisma.paper.update({
      where: { id: paperId },
      data: { doi: finalDoi, doiStatus: 'GENERATED' }
    });

    return NextResponse.json({ success: true, doi: updated.doi });
  } catch (error: any) {
    console.error('Crossref generate DOI error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
