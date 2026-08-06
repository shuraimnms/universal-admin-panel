export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const impactFactors = await prisma.impactFactor.findMany({
      orderBy: {
        year: 'desc'
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(impactFactors);
  } catch (error) {
    console.error('Error fetching impact factors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact factors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const year = parseInt(formData.get('year') as string);
    const value = parseFloat(formData.get('value') as string);
    const certificateFile = formData.get('certificate') as File | null;

    // Validate required fields
    if (!year || !value) {
      return NextResponse.json(
        { error: 'Year and value are required' },
        { status: 400 }
      );
    }

    // Check if year already exists
    const existingFactor = await prisma.impactFactor.findUnique({
      where: { year }
    });

    if (existingFactor) {
      return NextResponse.json(
        { error: 'Impact factor for this year already exists' },
        { status: 400 }
      );
    }

    let certificatePath: string | null = null;
    
    // Handle certificate upload
    if (certificateFile) {
      const bytes = await certificateFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `impact_factor_${year}_${timestamp}.pdf`;
      certificatePath = `/uploads/certificates/${filename}`;
      
      // Save file
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
    }

    const impactFactor = await prisma.impactFactor.create({
      data: {
        year,
        value,
        certificatePath,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(impactFactor, { status: 201 });
  } catch (error) {
    console.error('Error creating impact factor:', error);
    return NextResponse.json(
      { error: 'Failed to create impact factor' },
      { status: 500 }
    );
  }
}
