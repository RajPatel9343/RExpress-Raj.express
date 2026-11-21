import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            addressType: true,
            isDefault: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error('GET /api/users/profile error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, avatarUrl } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return NextResponse.json({ success: false, error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
      }
      // Check uniqueness (excluding current user)
      const existing = await prisma.user.findFirst({
        where: { email: trimmed, NOT: { id: session.userId } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another account' },
          { status: 409 }
        );
      }
      updateData.email = trimmed;
    }

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() || null : null;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl ? String(avatarUrl).trim() || null : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error('PUT /api/users/profile error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
