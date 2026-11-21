import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div className="space-y-2 pb-4 border-b border-theme-gray-border">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-black">
            Contact Rexpresso Concierge
          </h1>
          <p className="text-xs text-theme-gray-medium">
            We are here to assist with product inquiries, corporate orders, and logistics support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-theme-gray-dark">
          <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-2">
            <div className="flex items-center space-x-2 text-theme-black font-bold">
              <Phone className="w-4 h-4 text-theme-blue" />
              <span>Telephone Helpline</span>
            </div>
            <p className="text-sm font-bold text-theme-black">+91 (080) 4567-8900</p>
            <p className="text-[11px] text-theme-gray-medium">Available Monday to Saturday, 9 AM to 8 PM IST</p>
          </div>

          <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-2">
            <div className="flex items-center space-x-2 text-theme-black font-bold">
              <Mail className="w-4 h-4 text-theme-blue" />
              <span>Electronic Mail</span>
            </div>
            <p className="text-sm font-bold text-theme-black">concierge@Rexpressocommerce.com</p>
            <p className="text-[11px] text-theme-gray-medium">Guaranteed response within 4 business hours</p>
          </div>

          <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-2 sm:col-span-2">
            <div className="flex items-center space-x-2 text-theme-black font-bold">
              <MapPin className="w-4 h-4 text-theme-blue" />
              <span>Corporate Headquarters & Experience Center</span>
            </div>
            <p className="text-xs font-semibold text-theme-black">
              Rexpresso India Ltd.
            </p>
            <p className="text-xs text-theme-gray-dark">
              Level 8, Prestige Meridian 1, 29 M.G. Road, Bengaluru, Karnataka 560001, India
            </p>
            <p className="text-[11px] text-theme-gray-medium pt-1">
              Registered Corporate Identity: CIN U72900KA2026PLC098124 | GSTIN: 29AABCU9603R1ZM
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/support"
            className="inline-block px-6 py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
          >
            Submit an Online Support Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
