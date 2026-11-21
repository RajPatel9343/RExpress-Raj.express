'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  ArrowRight,
  AlertCircle,
  Lock,
  Radio,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, discount, couponCode, refreshCart } = useCart();

  // Multi-step index
  const [step, setStep] = useState(1);

  // Address fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  // Order processing states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Verification dialog for sandbox/gateway simulation
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<any>(null);
  const [gatewayPayload, setGatewayPayload] = useState<any>(null);

  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user]);

  // Recalculate shipping and grand total
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const expressFee = shippingMethod === 'EXPRESS' ? 149 : 0;
  const totalShipping = shippingCharge + expressFee;
  const finalPayable = Math.max(0, subtotal - discount + totalShipping);

  // Address validation
  const validateAddress = () => {
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      setErrorMessage('Please fill in all mandatory address fields marked with *');
      return false;
    }
    if (postalCode.trim().length !== 6) {
      setErrorMessage('Postal PIN code must be a valid 6-digit number');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateAddress()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const shippingAddress = {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country: 'India',
        addressType,
        deliveryNotes,
      };

      // 1. Create order on backend
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          couponCode,
          notes: deliveryNotes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setErrorMessage(orderData.error || 'Failed to place order.');
        setSubmitting(false);
        return;
      }

      const order = orderData.data;
      setCreatedOrderData(order);

      // 2. If COD, order is immediately confirmed
      if (paymentMethod === 'COD') {
        await refreshCart();
        router.push(`/checkout/success?orderId=${order.id}`);
        return;
      }

      // 3. If online payment (Razorpay), create payment gateway transaction
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        setErrorMessage(payData.error || 'Failed to initiate payment gateway.');
        setSubmitting(false);
        return;
      }

      setGatewayPayload(payData.data);
      setPaymentModalOpen(true);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during checkout.');
      setSubmitting(false);
    }
  };

  // Process payment confirmation with signature
  const handleVerifyPayment = async (simulatedPaymentId: string, simulatedSignature: string) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderData.id,
          razorpayOrderId: gatewayPayload.gatewayOrderId,
          razorpayPaymentId: simulatedPaymentId,
          razorpaySignature: simulatedSignature,
          paymentMethod: 'UPI',
        }),
      });

      const verifyData = await res.json();
      if (res.ok && verifyData.success) {
        await refreshCart();
        router.push(`/checkout/success?orderId=${createdOrderData.id}`);
      } else {
        setErrorMessage(verifyData.error || 'Payment signature verification failed.');
        setPaymentModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage('Verification network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !createdOrderData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-theme-gray-border text-center space-y-4">
        <h2 className="text-lg font-bold text-theme-black">Your Cart is Empty</h2>
        <p className="text-xs text-theme-gray-medium">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Steps Progress */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-theme-blue text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            1
          </div>
          <span className="text-xs font-bold text-theme-black">Shipping Address</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-theme-blue text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            2
          </div>
          <span className="text-xs font-bold text-theme-black">Payment & Review</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center space-x-2 max-w-3xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Step 1 or Step 2 */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            /* Step 1: Shipping Address Form */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-theme-gray-border">
                <MapPin className="w-5 h-5 text-theme-blue" />
                <h2 className="text-base font-bold text-theme-black">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-theme-black block mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arjun Mehta"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-black block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-theme-black block mb-1">
                    House / Flat No., Building, Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Flat 402, Skyline Residency, Road No. 12"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-theme-black block mb-1">
                    Area / Landmark / Colony (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near City Center Mall, Banjara Hills"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-black block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-black block mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-black block mb-1">
                    6-Digit Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 500034"
                    className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-black block mb-1">Address Type</label>
                  <div className="flex gap-2">
                    {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setAddressType(type)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                          addressType === type
                            ? 'bg-theme-blue text-white border-theme-blue'
                            : 'bg-white text-theme-gray-dark border-theme-gray-border'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping Method Option */}
              <div className="pt-4 border-t border-theme-gray-border space-y-3">
                <label className="font-bold text-xs text-theme-black uppercase tracking-wider block">
                  Select Shipping Speed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setShippingMethod('STANDARD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'STANDARD'
                        ? 'border-theme-blue bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-theme-gray-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-theme-black">
                      <span>Standard Courier Delivery</span>
                      <span>{subtotal >= 999 ? 'FREE' : '₹99'}</span>
                    </div>
                    <p className="text-gray-500 text-[11px] mt-1">
                      Estimated 2-4 business days via Delhivery Express.
                    </p>
                  </div>

                  <div
                    onClick={() => setShippingMethod('EXPRESS')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'EXPRESS'
                        ? 'border-theme-blue bg-blue-50/50 ring-2 ring-blue-100'
                        : 'border-theme-gray-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-theme-black">
                      <span>Priority Express Delivery</span>
                      <span>₹149</span>
                    </div>
                    <p className="text-gray-500 text-[11px] mt-1">
                      Guaranteed 24-48 hour delivery with VIP package insurance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateAddress()) setStep(2);
                  }}
                  className="px-6 py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center space-x-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Payment Selection */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-theme-blue" />
                  <h2 className="text-base font-bold text-theme-black">Select Payment Gateway</h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-theme-blue font-semibold hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Delivery Address Summary */}
              <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border text-xs space-y-1">
                <div className="font-bold text-theme-black flex items-center justify-between">
                  <span>Shipping to: {fullName} ({phone})</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] uppercase font-bold">
                    {addressType}
                  </span>
                </div>
                <p className="text-theme-gray-dark">
                  {addressLine1}, {addressLine2 ? `${addressLine2}, ` : ''}{city}, {state} - {postalCode}
                </p>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-theme-blue bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-theme-gray-border bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-theme-blue focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-theme-black flex items-center space-x-2">
                      <span>Online Payment (UPI, Credit/Debit Cards, Net Banking)</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-theme-gray-medium mt-1">
                      Pay securely with Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard or Net Banking.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'COD'
                      ? 'border-theme-blue bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-theme-gray-border bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-theme-blue focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-theme-black">
                      Cash on Delivery (Pay on Arrival)
                    </div>
                    <p className="text-[11px] text-theme-gray-medium mt-1">
                      Pay cash or UPI directly to the delivery agent when your parcel is delivered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order CTA */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-theme-gray-dark hover:text-black font-semibold"
                >
                  ← Back to Address
                </button>

                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  className="px-8 py-3.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Processing Order...' : `Pay ${formatPrice(finalPayable)}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-theme-black pb-3 border-b border-theme-gray-border">
              Order Review ({items.length} items)
            </h3>

            {/* Item Thumbnails Preview */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={item.product.images[0]?.url || 'https://via.placeholder.com/60'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg border border-theme-gray-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-theme-black truncate">{item.product.name}</p>
                    <p className="text-[11px] text-theme-gray-medium">
                      Qty: {item.quantity} {item.variant ? `(${item.variant.name})` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-theme-black">
                    {formatPrice((item.variant?.price ?? item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-theme-gray-border">
              <div className="flex justify-between text-theme-gray-dark">
                <span>Subtotal</span>
                <span className="font-bold text-theme-black">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-gray-dark">
                <span>Shipping ({shippingMethod})</span>
                <span>{totalShipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(totalShipping)}</span>
              </div>

              <div className="flex justify-between text-theme-gray-dark">
                <span>All Indian Taxes (18% GST)</span>
                <span>Included</span>
              </div>

              <div className="pt-3 border-t border-theme-gray-border flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-theme-black">Final Amount</span>
                <span className="text-2xl font-black text-theme-black">
                  {formatPrice(finalPayable)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Simulation / Verification Dialog */}
      {paymentModalOpen && gatewayPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-theme-gray-border">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-theme-black">Razorpay Payment Terminal</h3>
              <p className="text-xs text-theme-gray-medium">
                Order Reference: <span className="font-mono font-bold">{gatewayPayload.orderNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border text-center space-y-1">
              <span className="text-xs text-theme-gray-medium">Amount to Authorize</span>
              <div className="text-3xl font-black text-theme-black">
                {formatPrice(finalPayable)}
              </div>
              <div className="text-[10px] text-blue-700 font-semibold pt-1">
                {gatewayPayload.isConfigured
                  ? 'Live Razorpay API Integration Connected'
                  : 'Sandbox Verification Mode (Safe Test Mode Active)'}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleVerifyPayment(
                    `pay_test_${Date.now()}`,
                    `sig_sandbox_${Date.now()}_verified`
                  )
                }
                disabled={submitting}
                className="w-full py-3.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simulate Successful UPI / Card Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setErrorMessage('Payment was cancelled by user. You can retry anytime.');
                }}
                className="w-full py-2.5 text-xs text-theme-gray-medium hover:text-red-500"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
