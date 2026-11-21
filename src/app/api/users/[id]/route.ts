import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Users can only update their own profile unless they're admin
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(session.role);
    if (session.userId !== params.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, phone, avatarUrl } = await req.json();

    const updateData: Record<string, any> = {};
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('update-user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(session.role);
    if (session.userId !== params.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true, isBlocked: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot delete Super Admin account' }, { status: 400 });
    }

    // Safe anonymization / deletion:
    // Revoke sessions
    await prisma.userSession.deleteMany({ where: { userId: params.id } });

    // Anonymize user details to keep historical references intact
    await prisma.user.update({
      where: { id: params.id },
      data: {
        name: 'Deleted User',
        email: `deleted_${params.id}@rexpresso-deleted.internal`,
        phone: null,
        avatarUrl: null,
        isBlocked: true,
        blockedReason: 'Account deleted by Super Admin'
      }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'DELETE_USER_ANONYMIZED',
        entity: 'User',
        entityId: params.id,
        details: JSON.stringify({ originalEmail: targetUser.email })
      }
    });

    return NextResponse.json({ success: true, message: 'Account safely deleted and anonymized' });
  } catch (err: any) {
    console.error('delete user error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

