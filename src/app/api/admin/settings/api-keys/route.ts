export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(1, 'Key is required'),
  provider: z.string().min(1, 'Provider is required'),
  isActive: z.boolean().default(true),
});

const updateApiKeySchema = apiKeySchema.partial();

// GET - List all API keys
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    const where: any = {};
    if (provider) {
      where.provider = provider;
    }

    const apiKeys = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        provider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Only return the first 4 characters and last 4 characters of the key for security
        key: false, // We'll manually attach a masked version below
      }
    });

    // For full keys, you normally wouldn't send them back unless specifically requested.
    // However, if we need them in the admin UI to display masked:
    const keysWithMask = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const maskedApiKeys = keysWithMask.map(k => ({
      ...k,
      key: k.key.length > 8 
        ? `${k.key.substring(0, 4)}...${k.key.substring(k.key.length - 4)}`
        : '***'
    }));

    return NextResponse.json({ apiKeys: maskedApiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = apiKeySchema.parse(body);

    // Check if key already exists
    const existingKey = await prisma.apiKey.findFirst({
      where: { key: validatedData.key }
    });

    if (existingKey) {
      return NextResponse.json(
        { error: 'API key already exists' },
        { status: 400 }
      );
    }

    const newKey = await prisma.apiKey.create({
      data: {
        ...validatedData,
        createdBy: session.user.id
      }
    });

    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
