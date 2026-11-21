import React from 'react';
import { RotateCcw, ShieldCheck, Check, Clock } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-theme-black">
          Returns, Replacements & Refund Policy
        </h1>
        <p className="text-xs text-theme-gray-medium">
          Compliant with Indian Consumer Protection (E-Commerce) Rules, 2020. Last updated November 2026.
        </p>

        <div className="space-y-6 pt-4 text-xs text-theme-gray-dark leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-theme-black">1. 7-Day Doorstep Return Window</h2>
            <p>
              Eligible items purchased on Rexpresso can be returned or replaced within 7 calendar days of delivery.
              Products must be in their original unopened packaging, accompanied by all manufacturer seals, tags, accessories, and warranty cards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-theme-black">2. Manufacturing Defects & Transit Damage</h2>
            <p>
              In the rare event of transit damage or dead-on-arrival (DOA) electronics, notify our concierge support within 48 hours of delivery.
              We will arrange a priority doorstep replacement with reverse pickup at no additional cost.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-theme-black">3. Refund Processing Timelines</h2>
            <p>
              Once your returned package is inspected at our Mumbai or Bengaluru hub:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>UPI & Net Banking refunds reflect within 24 to 48 banking hours.</li>
              <li>Credit and Debit Card refunds reflect within 3 to 5 business days.</li>
              <li>Cash on Delivery (COD) orders are refunded via direct NEFT/IMPS bank transfer or instant store wallet credit.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
