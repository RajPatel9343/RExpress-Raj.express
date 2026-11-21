import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, Heart, MapPin, LifeBuoy, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AccountPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account');
  }

  // Fetch customer dashboard stats
  const [orders, wishlist, address] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: true },
    }),
    prisma.wishlist.findFirst({
      where: { userId: session.userId },
      include: { _count: { select: { items: true } } },
    }),
    prisma.userAddress.findFirst({
      where: { userId: session.userId, isDefault: true },
    }),
  ]);

  const totalOrdersCount = await prisma.order.count({
    where: { userId: session.userId },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Welcome back, {session.name}!
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Manage your personal addresses, review order dispatches, or browse saved flagships.
          </p>
        </div>
        <Link
          href="/products"
          className="px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
        >
          Shop Catalog
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-theme-gray-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-theme-gray-medium font-semibold">Total Orders</span>
            <div className="text-2xl font-black text-theme-black">{totalOrdersCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-theme-gray-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-theme-gray-medium font-semibold">Saved Items</span>
            <div className="text-2xl font-black text-theme-black">
              {wishlist?._count?.items ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-theme-gray-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-theme-gray-medium font-semibold">Account Status</span>
            <div className="text-sm font-bold text-green-700">Verified Member</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
          <h2 className="text-base font-bold text-theme-black">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-theme-blue font-bold hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-theme-gray-medium py-6 text-center">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          <div className="divide-y divide-theme-gray-border">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 flex items-center justify-between text-xs gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-theme-black">{ord.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                  <p className="text-[11px] text-theme-gray-medium mt-0.5">
                    Placed on {formatDate(ord.createdAt)} • {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-theme-black">
                    {formatPrice(ord.totalAmount)}
                  </span>
                  <Link
                    href={`/account/orders/${ord.id}`}
                    className="px-3 py-1.5 border border-theme-gray-border rounded-lg text-theme-black hover:border-theme-blue hover:text-theme-blue font-semibold"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Address */}
      {address && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
            <h2 className="text-base font-bold text-theme-black flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-theme-blue" />
              <span>Default Delivery Address</span>
            </h2>
            <Link
              href="/account/addresses"
              className="text-xs text-theme-blue font-bold hover:underline"
            >
              Manage Addresses
            </Link>
          </div>
          <p className="text-xs font-bold text-theme-black">{address.fullName} ({address.phone})</p>
          <p className="text-xs text-theme-gray-dark">
            {address.addressLine1}, {address.addressLine2 ? `${address.addressLine2}, ` : ''}{address.city}, {address.state} - {address.postalCode}
          </p>
        </div>
      )}
    </div>
  );
}
