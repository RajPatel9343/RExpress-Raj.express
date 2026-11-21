import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required to write a review' }, { status: 401 });
    }

    const { productId, rating, title, comment } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, rating (1-5), and review text are required' },
        { status: 400 }
      );
    }

    // Check if user has an order containing this product to verify purchase
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId: user.userId,
        status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = Boolean(verifiedOrder);

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.userId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title: title || '',
        comment,
        isVerifiedPurchase,
        isApproved: true,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Recalculate average rating for product
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 5.0,
        reviewCount: stats._count.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error: any) {
    console.error('Review submission failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}
