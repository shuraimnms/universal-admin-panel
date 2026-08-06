import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    return NextResponse.json({ success: true, user: user ? user.email : 'No users found' });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      clientVersion: error.clientVersion
    }, { status: 500 });
  }
}
