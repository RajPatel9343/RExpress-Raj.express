import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MapPin, Plus, CheckCircle, Home, Briefcase } from 'lucide-react';

export default async function AddressesPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login?redirect=/account/addresses');
  }

  const addresses = await prisma.userAddress.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Manage your primary residential, office, and secondary shipping destinations.
          </p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-theme-gray-border p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-theme-black">No Saved Addresses</h2>
          <p className="text-xs text-theme-gray-medium max-w-sm mx-auto">
            Addresses entered during checkout will automatically appear here for easy reuse.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm space-y-3 relative ${
                addr.isDefault ? 'border-theme-blue ring-2 ring-blue-50' : 'border-theme-gray-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-theme-black">
                  {addr.addressType === 'WORK' ? (
                    <Briefcase className="w-4 h-4 text-theme-blue" />
                  ) : (
                    <Home className="w-4 h-4 text-theme-blue" />
                  )}
                  <span>{addr.addressType}</span>
                </span>
                {addr.isDefault && (
                  <span className="px-2.5 py-0.5 bg-blue-50 text-theme-blue text-[10px] font-bold rounded-full">
                    Default Delivery
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-theme-black">{addr.fullName}</h3>
                <p className="text-xs text-theme-gray-medium">{addr.phone}</p>
              </div>

              <p className="text-xs text-theme-gray-dark leading-relaxed">
                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.postalCode}
              </p>

              {addr.deliveryNotes && (
                <p className="text-[11px] text-gray-500 italic bg-theme-gray-bg p-2 rounded-lg">
                  Note: &quot;{addr.deliveryNotes}&quot;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
