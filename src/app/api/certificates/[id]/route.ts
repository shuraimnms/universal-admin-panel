import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const data = await request.json();
    
    // If we're revoking the certificate
    if (data.status === 'REVOKED' || data.isValid === false) {
      const certificate = await prisma.certificate.update({
        where: { id: params.id },
        data: {
          isValid: false,
          revokedAt: new Date(),
          revokedBy: session.user.id
        }
      });
      
      return NextResponse.json({
        success: true,
        certificate,
        message: 'Certificate revoked successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'No changes made'
    });

  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}
