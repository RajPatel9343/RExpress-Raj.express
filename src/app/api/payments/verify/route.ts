import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = 'UPI',
    } = await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification details' },
        { status: 400 }
      );
    }

    // Verify backend HMAC SHA256 signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      // Record failed payment attempt
      await prisma.payment.updateMany({
        where: { transactionId: razorpayOrderId },
        data: {
          status: 'FAILED',
          signature: razorpaySignature,
        },
      });

      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed. Untrusted response.' },
        { status: 400 }
      );
    }

    // Update Payment record and Order record
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { transactionId: razorpayOrderId },
        data: {
          status: 'SUCCESS',
          signature: razorpaySignature,
          paymentMethod,
          rawResponse: JSON.stringify({ razorpayPaymentId, verifiedAt: new Date() }),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentId: razorpayPaymentId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
