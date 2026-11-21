import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    description: 'Complimentary expedited delivery on all orders over ₹999.',
  },
  {
    icon: RotateCcw,
    title: '7-Day Return Guarantee',
    description: 'Effortless door-to-door returns with instant refund verification.',
  },
  {
    icon: ShieldCheck,
    title: '100% Verified Authentic',
    description: 'Direct manufacturer sourcing with official brand warranties.',
  },
  {
    icon: Headphones,
    title: '24/7 Concierge Support',
    description: 'Dedicated phone, email and ticket assistance by tech specialists.',
  },
];

export default function TrustBadges() {
  return (
    <div className="py-8 bg-theme-gray-bg border-y border-theme-gray-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-theme-gray-border shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-theme-black uppercase tracking-wider">
                    {b.title}
                  </h4>
                  <p className="text-xs text-theme-gray-medium mt-0.5 leading-snug">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
