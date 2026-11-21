import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isAdminRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        store: { select: { id: true, name: true, slug: true } }
      }
    });

    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: offer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
      applicableTo,
      applicableIds,
      storeId
    } = body;

    const updated = await prisma.offer.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: parseFloat(minOrderAmount) }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(perUserLimit !== undefined && { perUserLimit: parseInt(perUserLimit) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(applicableTo && { applicableTo }),
        ...(applicableIds !== undefined && { applicableIds: typeof applicableIds === 'string' ? applicableIds : JSON.stringify(applicableIds) }),
        ...(storeId !== undefined && { storeId: storeId || null })
      }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'UPDATE_OFFER',
        entity: 'Offer',
        entityId: params.id,
        details: JSON.stringify({ title: updated.title })
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.offer.delete({
      where: { id: params.id }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'DELETE_OFFER',
        entity: 'Offer',
        entityId: params.id
      }
    });

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
