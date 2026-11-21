'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Package,
  Heart,
  MapPin,
  LifeBuoy,
  Shield,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-theme-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
    }
    return null;
  }

  const navItems = [
    { label: 'Profile Overview', href: '/account', icon: User },
    { label: 'My Orders & Invoices', href: '/account/orders', icon: Package },
    { label: 'Saved Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { label: 'Support & Tickets', href: '/support', icon: LifeBuoy },
    { label: 'Security & Password', href: '/account/security', icon: Shield },
  ];

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER'].includes(user.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Customer Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-theme-blue text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-theme-black truncate">{user.name}</h2>
              <p className="text-xs text-theme-gray-medium truncate">{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-theme-blue rounded-md text-[10px] font-bold">
                {user.role}
              </span>
            </div>
          </div>

          <nav className="bg-white p-3 rounded-3xl border border-theme-gray-border shadow-sm space-y-1 text-xs font-semibold">
            {isStaff && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-theme-blue bg-blue-50/70 hover:bg-blue-100 transition-colors mb-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Admin Dashboard</span>
              </Link>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-theme-blue text-white shadow-sm'
                      : 'text-theme-gray-dark hover:bg-theme-gray-bg'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-left pt-2 border-t border-theme-gray-border"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Dashboard Main View */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
