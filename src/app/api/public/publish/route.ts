export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const request = await prisma.serviceRequest.create({
      data: {
        userId: data.userId || null,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        affiliation: data.affiliation || null,
        pubType: data.pubType,
        title: data.title,
        targetJournal: data.target || null,
        description: data.description || '',
      }
    });

    return NextResponse.json({ success: true, request }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error('Error submitting public publish request:', error);
    return NextResponse.json({ error: 'Failed to submit request: ' + error.message }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
