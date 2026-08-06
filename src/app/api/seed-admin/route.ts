import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'admin@va-ra.com';
    const password = 'admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        role: 'SUPERADMIN',
        isVerified: true,
      },
      create: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPERADMIN',
        isVerified: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Admin user seeded successfully!', email: user.email });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
