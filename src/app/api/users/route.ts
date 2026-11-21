import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    } else {
      where.role = { in: ['CUSTOMER', 'SELLER'] };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isBlocked: true,
        blockedAt: true,
        blockedReason: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            paymentStatus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
