import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, isStaffRole } from '@/lib/auth';
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

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: Record<string, any> = {
      role: role && STAFF_ROLES.includes(role) ? role : { in: STAFF_ROLES },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { staff, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/admin/staff error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const body = await req.json();
    const { name, email, password, role, phone } = body;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json({ success: false, error: 'name, email, password, role are required' }, { status: 400 });
    }

    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: `Invalid role. Must be one of: ${STAFF_ROLES.join(', ')}` }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          role,
          phone: phone?.trim() || null,
          isVerified: true,
        },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session!.userId,
          action: 'CREATE_STAFF',
          entity: 'User',
          details: JSON.stringify({ email: email.trim().toLowerCase(), role }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/staff error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
