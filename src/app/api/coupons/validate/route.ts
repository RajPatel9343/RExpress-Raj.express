import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { code, cartSubtotal, cartId } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired coupon code' },
        { status: 400 }
      );
    }

    // Check expiration date
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check global usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Coupon usage limit has been reached' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (cartSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    // Check per-user limit if user is authenticated
    if (user) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: user.userId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json(
          { success: false, error: 'You have already used this coupon the maximum allowed times.' },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, cartSubtotal);

    // If cartId provided, update cart record
    if (cartId) {
      await prisma.cart.update({
        where: { id: cartId },
        data: {
          couponCode: coupon.code,
          discount: discountAmount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      data: {
        code: coupon.code,
        discountAmount,
        description: coupon.description,
      },
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
