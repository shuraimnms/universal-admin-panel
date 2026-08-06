export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure CORS headers are applied
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
  });
}

export async function GET(req: Request) {
  try {
    const sites = await prisma.site.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        domain: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ sites }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error fetching public sites:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
