export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const settings = await prisma.crossrefJournalSettings.findUnique({
      where: { siteId }
    });

    return NextResponse.json(settings || {});
  } catch (error: any) {
    console.error('Crossref journal settings GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    if (!data.siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const updateData = {
      journalName: data.journalName,
      shortName: data.shortName,
      issn: data.issn,
      eissn: data.eissn,
      publisher: data.publisher,
      crossrefPrefix: data.crossrefPrefix,
      license: data.license,
      language: data.language,
      country: data.country,
      homepage: data.homepage,
      oaiEndpoint: data.oaiEndpoint,
      publicationFrequency: data.publicationFrequency,
      copyright: data.copyright,
      openAccess: data.openAccess,
      peerReview: data.peerReview
    };

    const result = await prisma.crossrefJournalSettings.upsert({
      where: { siteId: data.siteId },
      update: updateData,
      create: {
        siteId: data.siteId,
        ...updateData
      }
    });

    return NextResponse.json({ success: true, settings: result });
  } catch (error: any) {
    console.error('Crossref journal settings POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
