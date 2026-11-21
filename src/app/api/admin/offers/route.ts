import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ];
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        store: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    if (!title || discountValue === undefined) {
      return NextResponse.json({ success: false, error: 'Title and discount value are required' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        applicableTo: applicableTo || 'ALL',
        applicableIds: applicableIds ? (typeof applicableIds === 'string' ? applicableIds : JSON.stringify(applicableIds)) : null,
        storeId: storeId || null
      }
    });

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'CREATE_OFFER',
        entity: 'Offer',
        entityId: offer.id,
        details: JSON.stringify({ title: offer.title, discountValue: offer.discountValue })
      }
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
