import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json(
        { success: false, data: null },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}
