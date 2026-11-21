import React from 'react';
import prisma from '@/lib/prisma';
import { Tag, Plus, CheckCircle, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    include: {
      _count: { select: { usages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Promotional Coupons & Campaigns
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Create discount rules, manage redemption thresholds, and monitor campaign performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black text-theme-blue bg-blue-50 px-3 py-1 rounded-xl">
                {c.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.isActive ? 'Active' : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-theme-gray-dark min-h-[32px]">{c.description || 'Promotional coupon'}</p>

            <div className="pt-3 border-t border-theme-gray-border space-y-1.5 text-xs">
              <div className="flex justify-between text-theme-gray-dark">
                <span>Discount Value:</span>
                <span className="font-bold text-theme-black">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : formatPrice(c.discountValue)}
                </span>
              </div>

              <div className="flex justify-between text-theme-gray-dark">
                <span>Min Order Amount:</span>
                <span className="font-bold text-theme-black">{formatPrice(c.minOrderAmount)}</span>
              </div>

              {c.maxDiscountAmount && (
                <div className="flex justify-between text-theme-gray-dark">
                  <span>Max Cap:</span>
                  <span className="font-bold text-theme-black">{formatPrice(c.maxDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-gray-dark">
                <span>Usage Limit:</span>
                <span className="font-bold text-theme-black">
                  {c.usageCount} / {c.usageLimit || '∞'} used
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
