import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;

    // Look up by ID or by Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: {
          include: {
            parent: true,
          },
        },
        brand: true,
        variants: true,
        attributes: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
            images: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
