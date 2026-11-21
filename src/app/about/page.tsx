import React from 'react';
import { ShieldCheck, Award, Truck, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-4">
        <span className="px-3 py-1 bg-blue-50 text-theme-blue rounded-full text-xs font-bold uppercase tracking-wider">
          Our Heritage & Ethos
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-theme-black tracking-tight">
          Crafting the Standard of Indian Luxury Commerce
        </h1>
        <p className="text-xs sm:text-sm text-theme-gray-medium max-w-2xl mx-auto leading-relaxed">
          Founded in Bengaluru, Rexpresso is dedicated to providing tech lovers and creators
          with authentic high-end audio engineering, flagship mobile computing, and designer accessories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-white p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-theme-black">100% Direct Manufacturer Lineage</h2>
          <p className="text-xs text-theme-gray-dark leading-relaxed">
            We partner directly with leading international brands including Sony, Apple, Bose, Nike, and Dyson.
            Every item dispatched from our fulfillment hubs includes complete manufacturer serial tracking, official tax invoices, and comprehensive domestic warranties.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-theme-black">Expedited Metro Logistics</h2>
          <p className="text-xs text-theme-gray-dark leading-relaxed">
            Operating from state-of-the-art climate-controlled fulfillment centers in Mumbai, Bengaluru, and Delhi NCR,
            our logistics pipeline ensures same-day dispatch and 24-48 hour delivery to major Indian metros.
          </p>
        </div>
      </div>
    </div>
  );
}
