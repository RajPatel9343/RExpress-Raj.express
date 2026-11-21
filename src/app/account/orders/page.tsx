import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Truck, ArrowRight, FileText } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function CustomerOrdersPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-theme-black">
          My Orders & Dispatch History
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Review, track real-time delivery timelines, and download tax invoices for all purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-theme-gray-border p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-theme-black">No Orders Placed Yet</h2>
          <p className="text-xs text-theme-gray-medium max-w-sm mx-auto">
            Explore our curated selection of flagship electronics, acoustic headphones, and designer collections.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-theme-gray-border p-6 shadow-sm space-y-4 hover:border-blue-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-theme-gray-border gap-2 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-theme-black text-sm">{ord.orderNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-theme-gray-medium mt-0.5 block">
                    Ordered on {formatDate(ord.createdAt)} • Payment: {ord.paymentMethod} ({ord.paymentStatus})
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-black text-theme-black block">
                    {formatPrice(ord.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {ord.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 text-xs">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-theme-gray-border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-theme-black truncate">{item.productName}</p>
                      <p className="text-[11px] text-theme-gray-medium">
                        Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-theme-black">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-theme-gray-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-theme-gray-medium text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-theme-blue" />
                  <span>Carrier: {ord.courierName || 'Delhivery Express'}</span>
                  {ord.trackingNumber && (
                    <span className="font-mono text-theme-black font-semibold">({ord.trackingNumber})</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    href={`/account/orders/${ord.id}`}
                    className="px-4 py-2 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
                  >
                    View Timeline & Invoice
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
