import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlist?.items.map((i) => i.product) || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Get or create wishlist for user
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: user.userId },
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Removed from wishlist',
      });
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Added to wishlist',
      });
    }
  } catch (error: any) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wishlist' }, { status: 500 });
  }
}
