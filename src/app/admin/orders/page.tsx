import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingBag, ArrowUpRight, Search } from 'lucide-react';

interface AdminOrdersPageProps {
  searchParams: { status?: string };
}

export const revalidate = 0;

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const statusFilter = searchParams.status;
  const where: any = {};
  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Order Fulfillment & Logistics
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Track order lifecycles, assign tracking numbers, and manage invoice dispatches.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === 'ALL' ? '/admin/orders' : `/admin/orders?status=${s}`}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors ${
              (statusFilter === s || (!statusFilter && s === 'ALL'))
                ? 'bg-theme-blue text-white shadow-sm'
                : 'bg-white border border-theme-gray-border text-theme-gray-dark hover:border-theme-blue'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-theme-gray-medium">
                    No orders match the selected status filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-theme-black">
                      {ord.orderNumber}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-theme-black block">{ord.user?.name || 'Customer'}</span>
                      <span className="text-[11px] text-theme-gray-medium">{ord.user?.email}</span>
                    </td>
                    <td className="p-4 text-theme-gray-medium">{formatDate(ord.createdAt)}</td>
                    <td className="p-4">{ord.items.length} items</td>
                    <td className="p-4 font-extrabold text-theme-black">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-3 py-1.5 bg-theme-blue text-white rounded-lg font-bold hover:bg-theme-blue-dark transition-colors inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
