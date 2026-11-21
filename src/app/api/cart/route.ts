import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

const CART_SESSION_COOKIE = 'ecommerce_cart_session';

async function getOrCreateCart(userId?: string) {
  let sessionId: string | undefined;

  try {
    sessionId = cookies().get(CART_SESSION_COOKIE)?.value;
  } catch (err) {}

  if (!sessionId && !userId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 12);
    cookies().set({
      name: CART_SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  // If user is logged in, find cart by userId
  if (userId) {
    let userCart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: true,
          },
        },
      },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
              variant: true,
            },
          },
        },
      });
    }

    return userCart;
  }

  // Otherwise find cart by guest sessionId
  let guestCart = await prisma.cart.findFirst({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: true,
        },
      },
    },
  });

  if (!guestCart) {
    guestCart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: true,
          },
        },
      },
    });
  }

  return guestCart;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    const cart = await getOrCreateCart(user?.userId);

    // Recalculate subtotal using verified database product/variant prices
    let subtotal = 0;
    cart.items.forEach((item) => {
      const price = item.variant?.price ?? item.product.price;
      subtotal += price * item.quantity;
    });

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        subtotal,
        total: Math.max(0, subtotal - cart.discount),
      },
    });
  } catch (error: any) {
    console.error('Error in cart GET:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const cart = await getOrCreateCart(user?.userId);
    const body = await req.json();

    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Check product in DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isPublished) {
      return NextResponse.json({ success: false, error: 'Product not available' }, { status: 404 });
    }

    // Check variant if provided
    let itemPrice = product.price;
    let availableStock = product.stock;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ success: false, error: 'Product variant not found' }, { status: 404 });
      }
      itemPrice = variant.price;
      availableStock = variant.stock;
    }

    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${availableStock} units in stock` },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variantId === (variantId || null)
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        return NextResponse.json(
          { success: false, error: `Cannot add more than ${availableStock} units to cart` },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: itemPrice,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          price: itemPrice,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: updatedCart,
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ success: false, error: 'Failed to update cart' }, { status: 500 });
  }
}
