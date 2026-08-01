import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sites: any[] = [];
    
    // SuperAdmins get all sites
    if (session.user.role === 'ADMIN') {
      // In our multi-tenant model, all ADMINs currently see all sites, 
      // but later we can filter by UserSiteAccess if we introduce SUPER_ADMIN vs ADMIN
      sites = await prisma.site.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    }

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.name || !data.abbreviation) {
      return NextResponse.json({ error: 'Name and abbreviation are required' }, { status: 400 });
    }

    const site = await prisma.site.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation,
        domain: data.domain || null,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}
