import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { CheckCircle2, Package, Truck, ArrowRight, Printer } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface SuccessPageProps {
  searchParams: { orderId?: string };
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.orderId;

  let order: any = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });
  }

  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-12 shadow-sm text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">
            Order Confirmed & Payment Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-black mt-3">
            Thank you for your purchase!
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            We have emailed the official GST tax invoice and confirmation to{' '}
            <span className="font-semibold text-theme-black">{order?.user?.email || 'your registered email'}</span>.
          </p>
        </div>

        {/* Order Meta Box */}
        {order && (
          <div className="bg-theme-gray-bg rounded-2xl border border-theme-gray-border p-6 text-left space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-4 border-b border-theme-gray-border">
              <div>
                <span className="text-theme-gray-medium block">Order Number</span>
                <span className="font-mono font-bold text-theme-black">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-theme-gray-medium block">Order Date</span>
                <span className="font-bold text-theme-black">{formatDate(order.createdAt)}</span>
              </div>
              <div>
                <span className="text-theme-gray-medium block">Payment Method</span>
                <span className="font-bold text-theme-black">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-theme-gray-medium block">Total Paid</span>
                <span className="font-black text-theme-blue text-sm">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Delivery Estimation */}
            <div className="flex items-center space-x-3 text-xs bg-white p-3.5 rounded-xl border border-theme-gray-border">
              <Truck className="w-5 h-5 text-theme-blue flex-shrink-0" />
              <div>
                <span className="font-bold text-theme-black">Expected Arrival: {formatDate(estimatedDelivery)}</span>
                <p className="text-[11px] text-theme-gray-medium">
                  Assigned Courier: Delhivery Logistics Express with real-time GPS tracking.
                </p>
              </div>
            </div>

            {/* Ordered Items Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-theme-black uppercase tracking-wider block">
                Purchased Items ({order.items.length})
              </span>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-theme-gray-dark truncate max-w-sm">
                      {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                    </span>
                    <span className="font-bold text-theme-black">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-6 py-3.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>View Orders & Track Package</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 bg-theme-gray-light text-theme-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
