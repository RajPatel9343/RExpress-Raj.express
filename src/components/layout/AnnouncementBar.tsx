import React from 'react';
import Link from 'next/link';
import { Truck, Phone, ShieldCheck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-theme-black text-white text-xs py-2 px-4 border-b border-theme-gray-dark">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Complimentary Express Shipping on orders above ₹999</span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>100% Verified Authentic Luxury</span>
          </div>
        </div>

        <div className="flex items-center space-x-5 text-gray-300">
          <Link href="/track-order" className="hover:text-blue-400 transition-colors">
            Track Order
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/support" className="hover:text-blue-400 transition-colors">
            Support Desk
          </Link>
          <span className="text-gray-600">|</span>
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-blue-400" />
            <span className="font-medium text-white">+91 (080) 4567-8900</span>
          </div>
        </div>
      </div>
    </div>
  );
}
