export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ebook = await prisma.ebook.findUnique({
      where: { id: params.id }
    });

    if (!ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    return NextResponse.json({ ebook });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebook' },
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
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if ebook exists
    const existingEbook = await prisma.ebook.findUnique({
      where: { id: params.id }
    });

    if (!existingEbook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    // Parse JSON data
    const data = await request.json();
    
    const { 
      title, author, description, category, tags, 
      accessType = 'PUBLIC', price, trialPages, totalPages, 
      isPublished, fileUrl, coverImage, isbn, scribdUrl 
    } = data;

    // Validate required fields
    if (!title || !author || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, author, and category are required' },
        { status: 400 }
      );
    }

    // Validate access type
    const validAccessTypes = ['PUBLIC', 'LOGGED_IN_ONLY', 'PAID'];
    if (!validAccessTypes.includes(accessType)) {
      return NextResponse.json(
        { error: 'Invalid access type value' },
        { status: 400 }
      );
    }

    // Validate price for paid access
    let parsedPrice: number | null = null;
    if (accessType === 'PAID') {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        parsedPrice = 0;
      }
    }

    // Update ebook record in database
    const ebook = await prisma.ebook.update({
      where: { id: params.id },
      data: {
        title,
        author,
        description: description || null,
        category,
        tags: tags || null,
        access_type: accessType as 'PUBLIC' | 'LOGGED_IN_ONLY' | 'PAID',
        price: parsedPrice,
        trial_pages: trialPages ? parseInt(trialPages.toString()) : existingEbook.trial_pages,
        total_pages: totalPages ? parseInt(totalPages.toString()) : existingEbook.total_pages,
        is_published: !!isPublished,
        published_at: isPublished && !existingEbook.published_at ? new Date() : existingEbook.published_at,
        file_path: fileUrl || existingEbook.file_path,
        coverImage: coverImage || existingEbook.coverImage,
        isbn: isbn || null,
        scribdUrl: scribdUrl || null
      }
    });

    // Fetch updated ebook
    const updatedEbook = await prisma.ebook.findUnique({
      where: { id: ebook.id }
    });

    return NextResponse.json({
      success: true,
      ebook: updatedEbook,
      message: 'Ebook updated successfully'
    });

  } catch (error) {
    console.error('Error updating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to update ebook' },
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
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if ebook exists
    const existingEbook = await prisma.ebook.findUnique({
      where: { id: params.id }
    });

    if (!existingEbook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    // Delete associated files (wrapped in try/catch to avoid blocking database deletion)
    try {
      if (existingEbook.file_path && !existingEbook.file_path.startsWith('http')) {
        const pdfPath = join(process.cwd(), 'public', existingEbook.file_path);
        if (existsSync(pdfPath)) {
          await unlink(pdfPath);
        }
      }
    } catch (err) {
      console.error('Failed to delete physical PDF file:', err);
    }

    try {
      if (existingEbook.coverImage && !existingEbook.coverImage.startsWith('http')) {
        const coverPath = join(process.cwd(), 'public', existingEbook.coverImage);
        if (existsSync(coverPath)) {
          await unlink(coverPath);
        }
      }
    } catch (err) {
      console.error('Failed to delete physical cover image:', err);
    }

    // Delete ebook record (this will cascade delete related records)
    await prisma.ebook.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Ebook deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ebook:', error);
    return NextResponse.json(
      { error: 'Failed to delete ebook' },
      { status: 500 }
    );
  }
}