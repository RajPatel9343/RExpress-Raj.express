import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  Star,
  LifeBuoy,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Building2,
  Percent,
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();

  // If not logged in, redirect to admin login
  if (!session) {
    redirect('/admin/login');
  }

  // Enforce Staff RBAC role
  if (!isStaffRole(session.role)) {
    redirect('/?error=UnauthorizedAdminAccess');
  }

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Staff Management', href: '/admin/staff', icon: ShieldCheck },
    { label: 'Inventory & Stock', href: '/admin/inventory', icon: Warehouse },
    { label: 'Coupons & Deals', href: '/admin/coupons', icon: Tag },
    { label: 'Stores', href: '/admin/stores', icon: Building2 },
    { label: 'Offers & Promotions', href: '/admin/offers', icon: Percent },
    { label: 'Support Desk', href: '/admin/support', icon: LifeBuoy },
    { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-theme-gray-bg flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-theme-black text-gray-300 flex flex-col justify-between p-4 flex-shrink-0 border-r border-theme-gray-dark">
        <div className="space-y-6">
          {/* Logo & Role Badge */}
          <div className="px-3 py-2 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-theme-blue text-white rounded-lg flex items-center justify-center font-bold text-base">
                R
              </div>
              <span className="font-extrabold text-white text-base tracking-wider">
                Rexpresso <span className="text-blue-500">Admin</span>
              </span>
            </Link>
          </div>

          {/* Admin User Card */}
          <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white truncate">{session.name.split(' ')[0]}</span>
              <span className="px-2 py-0.5 bg-blue-900/60 text-blue-400 rounded text-[9px] font-bold">
                {session.role}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate">{session.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Storefront preview & Logout */}
        <div className="pt-4 border-t border-gray-800 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Storefront</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
