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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        sellers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { products: true } },
      },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: store });
  } catch (err) {
    console.error('GET /api/admin/stores/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

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

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (!String(name).trim()) return NextResponse.json({ success: false, error: 'Name cannot be empty' }, { status: 400 });
      updateData.name = String(name).trim();
    }

    if (slug !== undefined) {
      const trimmed = String(slug).trim();
      if (!/^[a-z0-9-]+$/.test(trimmed)) {
        return NextResponse.json({ success: false, error: 'Invalid slug format' }, { status: 400 });
      }
      const dup = await prisma.store.findFirst({ where: { slug: trimmed, NOT: { id: params.id } } });
      if (dup) return NextResponse.json({ success: false, error: 'Slug already in use' }, { status: 409 });
      updateData.slug = trimmed;
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl?.trim() || null;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail?.trim() || null;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode?.trim() || null;

    if (ownerId !== undefined) {
      if (ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: ownerId } });
        if (!owner) return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
      }
      updateData.ownerId = ownerId || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.store.update({
      where: { id: params.id },
      data: updateData,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session!.userId,
        action: 'UPDATE_STORE',
        entity: 'Store',
        entityId: params.id,
        details: JSON.stringify({ changes: Object.keys(updateData) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /api/admin/stores/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.store.delete({ where: { id: params.id } }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session!.userId,
          action: 'DELETE_STORE',
          entity: 'Store',
          entityId: params.id,
          details: JSON.stringify({ name: store.name, slug: store.slug }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Store deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/stores/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { session } = auth;

    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body; // 'activate' | 'deactivate' | 'suspend' | 'unsuspend'

    const updateData: Record<string, any> = {};
    let logAction = '';

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        logAction = 'ACTIVATE_STORE';
        break;
      case 'deactivate':
        updateData.isActive = false;
        logAction = 'DEACTIVATE_STORE';
        break;
      case 'suspend':
        updateData.isSuspended = true;
        logAction = 'SUSPEND_STORE';
        break;
      case 'unsuspend':
        updateData.isSuspended = false;
        logAction = 'UNSUSPEND_STORE';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: activate, deactivate, suspend, unsuspend' },
          { status: 400 }
        );
    }

    const updated = await prisma.store.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, isActive: true, isSuspended: true },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session!.userId,
        action: logAction,
        entity: 'Store',
        entityId: params.id,
        details: JSON.stringify({ storeName: store.name }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('PATCH /api/admin/stores/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
