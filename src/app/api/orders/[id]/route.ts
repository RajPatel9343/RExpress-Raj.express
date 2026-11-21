import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
        ...(!isStaffRole(user.role) ? { userId: user.userId } : {}),
      },
      include: {
        items: true,
        payments: true,
        returns: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, cancellationReason, trackingNumber, courierName, adminNotes } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Customer cancellation validation
    if (!isStaffRole(user.role)) {
      if (existingOrder.userId !== user.userId) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      if (status !== 'CANCELLED') {
        return NextResponse.json({ success: false, error: 'Customers can only cancel orders' }, { status: 400 });
      }
      if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
        return NextResponse.json(
          { success: false, error: 'Order has already been processed or shipped and cannot be cancelled.' },
          { status: 400 }
        );
      }
    }

    // If order is being cancelled, restore inventory
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: cancellationReason || 'Cancelled by customer',
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully and inventory restored',
      });
    }

    // Admin updates (tracking, status transition, admin notes)
    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (courierName) updateData.courierName = courierName;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
