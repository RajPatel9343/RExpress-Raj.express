'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Truck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { getTrackingTimeline } from '@/lib/shipping/shiprocket';

interface OrderDetailViewProps {
  order: any;
}

export default function OrderDetailView({ order }: OrderDetailViewProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found better price / Changed mind');
  const [actionError, setActionError] = useState('');

  let shippingAddress: any = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch (err) {}

  const timeline = getTrackingTimeline(order);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    setActionError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: cancelReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCancelModalOpen(false);
        router.refresh();
      } else {
        setActionError(data.error || 'Failed to cancel order');
      }
    } catch (err: any) {
      setActionError('Network error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-theme-blue font-bold flex items-center space-x-1 mb-2 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-theme-black">
              Order {order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'DELIVERED'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-theme-gray-medium mt-1">
            Placed on {formatDateTime(order.createdAt)} • Payment Method: {order.paymentMethod} ({order.paymentStatus})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-theme-gray-light text-theme-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* Real-Time Shipping Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <h2 className="text-base font-bold text-theme-black flex items-center space-x-2">
          <Truck className="w-4 h-4 text-theme-blue" />
          <span>Fulfillment & Dispatch Timeline</span>
        </h2>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-6">
          {timeline.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Circle Marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.completed
                    ? 'bg-theme-blue text-white ring-4 ring-blue-50'
                    : step.current
                    ? 'bg-amber-500 text-white ring-4 ring-amber-50'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? '✓' : idx + 1}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                  <h3 className="font-bold text-theme-black text-sm">{step.title}</h3>
                  <span className="text-[11px] text-theme-gray-medium">{step.time}</span>
                </div>
                <p className="text-xs text-theme-gray-dark mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items & Calculations Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <h2 className="text-base font-bold text-theme-black">Order Line Items</h2>

        <div className="divide-y divide-theme-gray-border">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-4">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-xl border border-theme-gray-border flex-shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-bold text-theme-black text-sm">{item.productName}</h4>
                  <p className="text-[11px] text-theme-gray-medium">
                    SKU: {item.productSku} {item.variantName ? `• Variant: ${item.variantName}` : ''}
                  </p>
                  <p className="text-xs text-theme-gray-dark font-medium mt-1">
                    Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-theme-black">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-theme-gray-border max-w-sm ml-auto space-y-2 text-xs">
          <div className="flex justify-between text-theme-gray-dark">
            <span>Subtotal</span>
            <span className="font-bold text-theme-black">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Promotional Discount</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-theme-gray-dark">
            <span>Shipping & Packaging</span>
            <span>{order.shippingFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(order.shippingFee)}</span>
          </div>

          <div className="flex justify-between text-theme-gray-dark">
            <span>GST & Central Taxes (18%)</span>
            <span>{formatPrice(order.taxAmount)}</span>
          </div>

          <div className="pt-2 border-t border-theme-gray-border flex justify-between items-baseline">
            <span className="text-sm font-black text-theme-black">Total Paid</span>
            <span className="text-xl font-black text-theme-blue">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address & Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm text-xs space-y-2">
          <h3 className="font-bold text-theme-black text-sm pb-2 border-b border-theme-gray-border">
            Shipping Destination
          </h3>
          <p className="font-bold text-theme-black">{shippingAddress.fullName} ({shippingAddress.phone})</p>
          <p className="text-theme-gray-dark">
            {shippingAddress.addressLine1}, {shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}, ` : ''}{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm text-xs space-y-3">
          <h3 className="font-bold text-theme-black text-sm pb-2 border-b border-theme-gray-border">
            Concierge Assistance
          </h3>
          <p className="text-theme-gray-medium">
            Have questions regarding this order? Our technical specialists are available 24/7.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center space-x-2 text-xs font-bold text-theme-blue hover:underline"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Open Support Ticket for this Order</span>
          </Link>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-theme-gray-border">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-theme-black">Cancel Order Confirmation</h3>
            </div>

            <p className="text-xs text-theme-gray-dark leading-relaxed">
              Are you sure you wish to cancel order <span className="font-bold">{order.orderNumber}</span>?
              Your stock reservation will be immediately restored and any online payment will be refunded to your original payment method.
            </p>

            <div>
              <label className="text-xs font-bold text-theme-black block mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              >
                <option value="Found better price / Changed mind">Found better price / Changed mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-theme-gray-border text-theme-gray-dark rounded-xl text-xs font-semibold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:bg-gray-300"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
