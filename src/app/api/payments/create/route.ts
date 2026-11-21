import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/payments/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: false, error: 'Order is already paid' }, { status: 400 });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const rzpOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userEmail: user.email,
      },
    });

    // Save pending Payment record
    await prisma.payment.upsert({
      where: { transactionId: rzpOrder.id },
      update: {
        amount: order.totalAmount,
        status: 'PENDING',
      },
      create: {
        orderId: order.id,
        transactionId: rzpOrder.id,
        gateway: 'RAZORPAY',
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        gatewayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: getRazorpayKeyId(),
        isConfigured: isRazorpayConfigured(),
        isSandbox: Boolean(rzpOrder.isSandbox),
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
