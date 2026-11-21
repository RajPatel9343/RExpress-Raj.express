import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div className="space-y-2 pb-4 border-b border-theme-gray-border">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-black">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs text-theme-gray-medium">
            Commercial terms governing all purchases on Rexpresso.
          </p>
        </div>

        <div className="space-y-4 text-xs text-theme-gray-dark leading-relaxed">
          <h2 className="text-sm font-bold text-theme-black">1. Commercial Contract</h2>
          <p>
            By placing an order on Rexpresso, you enter into a binding purchase agreement. All product prices are quoted in Indian Rupees (₹ INR) inclusive of statutory Goods and Services Tax (GST).
          </p>

          <h2 className="text-sm font-bold text-theme-black">2. Product Authenticity Guarantee</h2>
          <p>
            All consumer electronic products, headphones, smartphones, and accessories sold are 100% authentic original units sourced directly through official brand distribution networks with domestic warranty coverage.
          </p>

          <h2 className="text-sm font-bold text-theme-black">3. Governing Jurisdiction</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising out of purchases shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
          </p>
        </div>
      </div>
    </div>
  );
}
