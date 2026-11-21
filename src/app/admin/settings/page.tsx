import React from 'react';
import prisma from '@/lib/prisma';
import { Settings, Shield, CreditCard, Truck, Mail, CheckCircle2 } from 'lucide-react';
import { isRazorpayConfigured } from '@/lib/payments/razorpay';
import { isShippingConfigured } from '@/lib/shipping/shiprocket';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const settingsMap = settings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const rzpConfigured = isRazorpayConfigured();
  const shipConfigured = isShippingConfigured();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-theme-black">
          System & Integration Settings
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Configure legal entity details, payment gateways, and shipping providers.
        </p>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Razorpay Gateway */}
        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 bg-blue-50 text-theme-blue rounded-xl flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                rzpConfigured
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {rzpConfigured ? 'Live Production Mode' : 'Sandbox Verification Mode'}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-black">Razorpay Payments</h3>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Supports UPI, Credit/Debit cards, Net Banking, and webhooks.
            </p>
          </div>
          <div className="text-[11px] font-mono text-gray-500 bg-theme-gray-bg p-2.5 rounded-xl border border-theme-gray-border">
            Key ID: {process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey12345'}
          </div>
        </div>

        {/* Shipping Gateway */}
        <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 bg-blue-50 text-theme-blue rounded-xl flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
              Courier Dispatch Active
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-black">Delhivery & Shiprocket Logistics</h3>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Automated serviceability checks, tracking AWB assignment, and rate calculation.
            </p>
          </div>
          <div className="text-[11px] font-mono text-gray-500 bg-theme-gray-bg p-2.5 rounded-xl border border-theme-gray-border">
            Hubs: Mumbai, Bengaluru, Delhi NCR
          </div>
        </div>
      </div>

      {/* Corporate Registration Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-theme-black pb-3 border-b border-theme-gray-border">
          Corporate & Tax Identification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-theme-gray-medium block">Store Name</span>
            <span className="font-bold text-theme-black text-sm">{settingsMap.STORE_NAME || 'Rexpresso'}</span>
          </div>

          <div>
            <span className="font-bold text-theme-gray-medium block">Registered GSTIN</span>
            <span className="font-mono font-bold text-theme-black text-sm">{settingsMap.GSTIN || '29AABCU9603R1ZM'}</span>
          </div>

          <div>
            <span className="font-bold text-theme-gray-medium block">Concierge Support Email</span>
            <span className="font-bold text-theme-black">{settingsMap.SUPPORT_EMAIL || 'concierge@Rexpressocommerce.com'}</span>
          </div>

          <div>
            <span className="font-bold text-theme-gray-medium block">Toll-Free Helpline</span>
            <span className="font-bold text-theme-black">{settingsMap.SUPPORT_PHONE || '+91 (080) 4567-8900'}</span>
          </div>

          <div>
            <span className="font-bold text-theme-gray-medium block">Free Shipping Threshold</span>
            <span className="font-bold text-theme-black">₹{settingsMap.FREE_SHIPPING_THRESHOLD || '999'}</span>
          </div>

          <div>
            <span className="font-bold text-theme-gray-medium block">Standard Tax Rate</span>
            <span className="font-bold text-theme-black">{settingsMap.TAX_RATE_PERCENT || '18'}% GST</span>
          </div>
        </div>
      </div>
    </div>
  );
}
