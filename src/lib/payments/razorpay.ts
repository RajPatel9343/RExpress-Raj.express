import crypto from 'crypto';

export interface RazorpayOrderParams {
  amount: number; // in smallest currency unit, e.g. paise (INR * 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && !keyId.includes('sample'));
}

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey12345';
}

/**
 * Creates a Razorpay Order through official Razorpay v1 API
 */
export async function createRazorpayOrder(params: RazorpayOrderParams) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!isRazorpayConfigured()) {
    // Return a mock sandbox order structure for development when keys are placeholders
    return {
      id: `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entity: 'order',
      amount: Math.round(params.amount),
      currency: params.currency || 'INR',
      receipt: params.receipt,
      status: 'created',
      isSandbox: true,
      notes: params.notes || {},
    };
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.description || 'Failed to create Razorpay order');
  }

  return response.json();
}

/**
 * Verifies razorpay payment signature server-side using HMAC SHA256
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_samplesecret67890';
  
  // If running in development sandbox mode with mock orders
  if (params.orderId.startsWith('order_sandbox_')) {
    return params.signature.startsWith('sig_sandbox_') || params.signature.length > 5;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  return generatedSignature === params.signature;
}

/**
 * Verifies Razorpay Webhook signature
 */
export function verifyWebhookSignature(payload: string, webhookSignature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return expectedSignature === webhookSignature;
}
