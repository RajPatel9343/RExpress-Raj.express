import React from 'react';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { BarChart3, TrendingUp, Download, PieChart } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [totalRevenueResult, totalOrders, productsCount, categories] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Business Intelligence & Reports
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Data insights, category performance, and average order value breakdown.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-1">
          <span className="text-xs font-semibold text-theme-gray-medium">Gross Merchandise Value (GMV)</span>
          <div className="text-2xl font-black text-theme-black">{formatPrice(totalRevenue)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-1">
          <span className="text-xs font-semibold text-theme-gray-medium">Average Order Value (AOV)</span>
          <div className="text-2xl font-black text-theme-blue">{formatPrice(avgOrderValue)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-1">
          <span className="text-xs font-semibold text-theme-gray-medium">Active Catalog Depth</span>
          <div className="text-2xl font-black text-theme-black">{productsCount} products</div>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-4">
        <h2 className="text-base font-bold text-theme-black">Category Catalog Distribution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-theme-black block">{c.name}</span>
                <span className="text-[11px] text-theme-gray-medium">{c.slug}</span>
              </div>
              <span className="font-black text-theme-blue px-2.5 py-1 bg-white rounded-lg border border-theme-gray-border">
                {c._count.products} SKUs
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
