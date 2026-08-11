export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';


export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || 'ALL';
    const accessTypeFilter = searchParams.get('accessType') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const siteId = searchParams.get('siteId') || '';

    // Build where clause
    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        author?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        tags?: { contains: string; mode: 'insensitive' };
      }>;
      category?: string;
      access_type?: 'PUBLIC' | 'LOGGED_IN_ONLY' | 'PAID';
      siteId?: string | null;
    } = {};

    if (siteId) {
      if (siteId === 'global' || siteId === 'null') {
        where.siteId = null;
      } else {
        where.siteId = siteId;
      }
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { author: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    if (categoryFilter !== 'ALL') {
      where.category = categoryFilter;
    }

    if (accessTypeFilter !== 'ALL') {
      where.access_type = accessTypeFilter as 'PUBLIC' | 'LOGGED_IN_ONLY' | 'PAID';
    }

    // Get total count
    const totalEbooks = await prisma.ebook.count({ where });
    const totalPages = Math.ceil(totalEbooks / limit);

    // Get ebooks with pagination
    const ebooks = await prisma.ebook.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format ebooks data
    const formattedEbooks = ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      author: ebook.author,
      description: ebook.description,
      category: ebook.category,
      tags: ebook.tags ? ebook.tags.split(',').map(t => t.trim()) : [],
      accessType: ebook.access_type,
      price: ebook.price,
      isPublished: ebook.is_published,
      publishedAt: ebook.published_at,
      trialPages: ebook.trial_pages,
      totalPages: ebook.total_pages,
      coverImage: ebook.coverImage,
      filePath: ebook.file_path,
      createdAt: ebook.createdAt,
      updatedAt: ebook.updatedAt,
      createdBy: ebook.created_by,
      purchaseCount: 0,
      viewCount: 0
    }));

    return NextResponse.json({
      ebooks: formattedEbooks,
      totalEbooks,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
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

    // Parse JSON data
    const data = await request.json();
    
    const { 
      title, author, description, category, tags, 
      accessType = 'PUBLIC', price, trialPages, totalPages, 
      isPublished, fileUrl, coverImage, isbn, scribdUrl, siteId 
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

    let parsedPrice: number | null = null;
    if (accessType === 'PAID') {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        parsedPrice = 0;
      }
    }

    // Create ebook record in database
    const ebook = await prisma.ebook.create({
      data: {
        title,
        author,
        description: description || null,
        category,
        tags: tags || null,
        access_type: accessType as 'PUBLIC' | 'LOGGED_IN_ONLY' | 'PAID',
        price: parsedPrice,
        trial_pages: trialPages ? parseInt(trialPages.toString()) : 5,
        total_pages: totalPages ? parseInt(totalPages.toString()) : null,
        is_published: !!isPublished,
        published_at: isPublished ? new Date() : null,
        file_path: fileUrl || '',
        coverImage: coverImage || null,
        isbn: isbn || null,
        scribdUrl: scribdUrl || null,
        created_by: session.user.id,
        siteId: siteId || null
      }
    });

    // Fetch created ebook with relationships
    const createdEbook = await prisma.ebook.findUnique({
      where: { id: ebook.id }
    });

    return NextResponse.json({
      success: true,
      ebook: createdEbook,
      message: 'Ebook created successfully'
    });

  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to create ebook' },
      { status: 500 }
    );
  }
}
