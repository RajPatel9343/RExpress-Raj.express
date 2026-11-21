import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Customer only sees their own orders
    if (!isStaffRole(user.role)) {
      where.userId = user.userId;
    } else if (searchParams.get('userId')) {
      where.userId = searchParams.get('userId');
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to place order' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      shippingAddress,
      paymentMethod = 'RAZORPAY',
      couponCode,
      notes,
    } = body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.postalCode) {
      return NextResponse.json(
        { success: false, error: 'Complete shipping address is required.' },
        { status: 400 }
      );
    }

    // Retrieve user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    // Recalculate prices and verify stock
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.isPublished) {
        return NextResponse.json(
          { success: false, error: `Product ${item.product.name} is no longer available` },
          { status: 400 }
        );
      }

      let price = product.price;
      let availableStock = product.stock;
      let variantName: string | null = null;
      let sku = product.sku;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { success: false, error: `Variant for ${product.name} not found` },
            { status: 400 }
          );
        }
        price = variant.price;
        availableStock = variant.stock;
        variantName = variant.name;
        sku = variant.sku;
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Only ${availableStock} units available for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        variantId: item.variantId,
        productName: product.name,
        productSku: sku,
        productImage: item.product.images[0]?.url || null,
        variantName,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal,
      });
    }

    // Calculate coupon discount
    let discountAmount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
        validCouponId = coupon.id;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    // Shipping fee calculation: Free for orders >= ₹999, else ₹99
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const taxAmount = Math.round((subtotal * 0.18) * 100) / 100; // 18% GST estimate
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // Generate unique human-readable order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Execute atomic transaction: Create Order + Reduce Stock + Clear Cart
    const resultOrder = await prisma.$transaction(async (tx) => {
      // 1. Reduce stock for each product and variant
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      // 2. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.userId,
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          paymentMethod,
          currency: 'INR',
          subtotal,
          taxAmount,
          shippingFee,
          discountAmount,
          totalAmount,
          shippingAddressSnapshot: JSON.stringify(shippingAddress),
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 3. Record coupon usage if valid
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            userId: user.userId,
            orderId: newOrder.id,
            discountAmount,
          },
        });

        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 4. Clear user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { discount: 0, couponCode: null },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: resultOrder,
    });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
