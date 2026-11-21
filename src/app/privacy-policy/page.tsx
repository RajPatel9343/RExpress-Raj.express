import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div className="space-y-2 pb-4 border-b border-theme-gray-border">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-black">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs text-theme-gray-medium">
            In compliance with Digital Personal Data Protection Act (DPDPA), India.
          </p>
        </div>

        <div className="space-y-4 text-xs text-theme-gray-dark leading-relaxed">
          <h2 className="text-sm font-bold text-theme-black">1. Information We Collect</h2>
          <p>
            When registering, placing an order, or communicating with our concierge desk, we collect essential details including your name, email, shipping address, and telephone number. We never store raw debit/credit card CVV or sensitive banking passwords; all financial transactions are processed securely through RBI-compliant payment aggregators (Razorpay / Cashfree).
          </p>

          <h2 className="text-sm font-bold text-theme-black">2. Use of Personal Data</h2>
          <p>
            Your information is used solely to fulfill orders, generate legal GST invoices, provide automated shipment tracking notifications via SMS/email, and verify authentic transactions.
          </p>

          <h2 className="text-sm font-bold text-theme-black">3. Cookie Policy</h2>
          <p>
            We use secure HTTP-only cookies strictly for session authentication and persistent shopping cart synchronization across devices. We do not engage in third-party ad tracking or selling customer lists.
          </p>
        </div>
      </div>
    </div>
  );
}
