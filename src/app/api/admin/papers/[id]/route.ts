export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { revalidatePath } from 'next/cache';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const paper = await prisma.paper.findUnique({
      where: { id: params.id },
      include: {
        paperAuthors: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                institution: true
              }
            }
          },
          orderBy: {
            authorOrder: 'asc'
          }
        },
        issue: true
      }
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Format the response to match the frontend expectations
    const formattedPaper = {
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      category: paper.category,
      status: paper.status,
      createdAt: paper.submittedAt,
      doi: paper.doi || '',
      fileUrl: paper.filePath ? `/api/papers/${paper.id}/download` : null,
      keywords: paper.keywords ? paper.keywords.split(',').map(k => k.trim()) : [],
      authors: paper.paperAuthors.map(pa => ({
        name: `${pa.user.firstName} ${pa.user.lastName}`,
        email: pa.user.email,
        institution: pa.user.institution || ''
      }))
    };

    return NextResponse.json(formattedPaper);
  } catch (error) {
    console.error('Error fetching paper details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paper details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    if (body.doi !== undefined) {
      updateData.doi = body.doi;
    }

    if (body.scribdUrl !== undefined) {
      updateData.scribdUrl = body.scribdUrl;
    }

    const updatedPaper = await prisma.paper.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedPaper);
  } catch (error) {
    console.error('Error updating paper:', error);
    return NextResponse.json(
      { error: 'Failed to update paper' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.paper.delete({
      where: { id: params.id }
    });

    revalidatePath('/admin/papers');
    revalidatePath('/papers');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    );
  }
}
