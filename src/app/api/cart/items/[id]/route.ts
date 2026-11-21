import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { product: true, variant: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const maxStock = item.variant?.stock ?? item.product.stock;
    if (quantity > maxStock) {
      return NextResponse.json(
        { success: false, error: `Only ${maxStock} units available` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
