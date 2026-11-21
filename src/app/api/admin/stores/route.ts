import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session) return { error: 'Not authenticated', status: 401 };
  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    return { error: 'Forbidden – Admin only', status: 403 };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { contactEmail: { contains: search } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: { select: { products: true, sellers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { stores, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/admin/stores error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const body = await req.json();
    const {
      name,
      slug,
      description,
      logoUrl,
      bannerUrl,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      postalCode,
      ownerId,
    } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ success: false, error: 'name and slug are required' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      return NextResponse.json(
        { success: false, error: 'Slug must only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await prisma.store.findUnique({ where: { slug: slug.trim() } });
    if (existingSlug) {
      return NextResponse.json({ success: false, error: 'Slug already in use' }, { status: 409 });
    }

    // Validate owner if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) {
        return NextResponse.json({ success: false, error: 'Owner user not found' }, { status: 404 });
      }
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        postalCode: postalCode?.trim() || null,
        ownerId: ownerId || null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session!.userId,
        action: 'CREATE_STORE',
        entity: 'Store',
        entityId: store.id,
        details: JSON.stringify({ name: store.name, slug: store.slug }),
      },
    });

    return NextResponse.json({ success: true, data: store }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/stores error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
