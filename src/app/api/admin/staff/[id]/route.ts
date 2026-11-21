import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'PRODUCT_MANAGER',
  'ORDER_MANAGER',
  'INVENTORY_MANAGER',
  'MARKETING_MANAGER',
  'SUPPORT_AGENT',
  'ACCOUNTANT',
];

async function requireSuperAdmin() {
  const session = await getCurrentUser();
  if (!session) return { error: 'Not authenticated', status: 401 };
  if (session.role !== 'SUPER_ADMIN') return { error: 'Forbidden – Super Admin only', status: 403 };
  return { session };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSuperAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isBlocked: true,
        blockedAt: true,
        blockedReason: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !STAFF_ROLES.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error('GET /api/admin/staff/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSuperAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target || !STAFF_ROLES.includes(target.role)) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone, role, isBlocked } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return NextResponse.json({ success: false, error: 'Name cannot be empty' }, { status: 400 });
      updateData.name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
      }
      const dup = await prisma.user.findFirst({ where: { email: trimmed, NOT: { id: params.id } } });
      if (dup) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
      updateData.email = trimmed;
    }

    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() || null : null;

    if (role !== undefined) {
      if (!STAFF_ROLES.includes(role)) {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (isBlocked !== undefined) {
      updateData.isBlocked = Boolean(isBlocked);
      if (Boolean(isBlocked)) {
        updateData.blockedAt = new Date();
      } else {
        updateData.blockedAt = null;
        updateData.blockedReason = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, role: true, isBlocked: true, updatedAt: true },
      }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session!.userId,
          action: 'UPDATE_STAFF',
          entity: 'User',
          entityId: params.id,
          details: JSON.stringify({ changes: updateData }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error('PUT /api/admin/staff/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSuperAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target || !STAFF_ROLES.includes(target.role)) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    if (target.role === 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot delete Super Admin account' }, { status: 400 });
    }

    await prisma.$transaction([
      // Anonymize instead of hard delete to preserve logs
      prisma.user.update({
        where: { id: params.id },
        data: {
          email: `deleted_${params.id}@deleted.com`,
          name: 'Deleted Staff',
          phone: null,
          avatarUrl: null,
          isBlocked: true,
          role: 'CUSTOMER', // demote before deletion
        },
      }),
      prisma.userSession.deleteMany({ where: { userId: params.id } }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session!.userId,
          action: 'DELETE_STAFF',
          entity: 'User',
          entityId: params.id,
          details: JSON.stringify({ originalEmail: target.email, originalRole: target.role }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Staff member removed successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/staff/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
