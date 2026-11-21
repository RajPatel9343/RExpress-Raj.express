import React from 'react';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div className="space-y-2 pb-4 border-b border-theme-gray-border">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-black">
            Shipping & Dispatch Policy
          </h1>
          <p className="text-xs text-theme-gray-medium">
            Expedited transit schedules across India via Delhivery and Shiprocket partners.
          </p>
        </div>

        <div className="space-y-4 text-xs text-theme-gray-dark leading-relaxed">
          <h2 className="text-sm font-bold text-theme-black">1. Complimentary Free Delivery</h2>
          <p>
            All retail orders with a cart value equal to or greater than ₹999 qualify for complimentary express courier shipping across 20,000+ serviceable Indian PIN codes. Orders below ₹999 are charged a flat standard logistics fee of ₹99.
          </p>

          <h2 className="text-sm font-bold text-theme-black">2. Transit Windows & Same-Day Dispatch</h2>
          <p>
            Orders confirmed before 2:00 PM IST on business days are dispatched on the same day from our regional fulfillment center closest to your destination (Mumbai, Bengaluru, or Delhi NCR). Metro city deliveries arrive in 24 to 48 hours.
          </p>

          <h2 className="text-sm font-bold text-theme-black">3. Tamper-Evident Security Seals</h2>
          <p>
            All shipments are packed in heavy-duty tamper-evident security boxes with individual tracking barcodes. If you observe any evidence of seal tampering or physical carton damage upon delivery, please decline receipt and notify our concierge immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
