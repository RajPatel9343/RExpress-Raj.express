'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search autocomplete suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=5`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data?.products) {
              setSearchSuggestions(json.data.products);
              setShowSuggestions(true);
            }
          }
        } catch (err) {}
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'INVENTORY_MANAGER'].includes(user.role);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-theme-gray-border shadow-sm">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-theme-black hover:text-theme-blue rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-theme-blue text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-theme-blue-dark transition-colors">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-wider text-theme-black">
                  Rexpresso
                </span>
                <span className="text-[10px] tracking-widest text-theme-gray-medium uppercase -mt-1 font-medium">
                  Premium Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar with Autocomplete */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for premium electronics, headphones, luxury brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                  className="w-full pl-11 pr-24 py-2.5 text-sm bg-theme-gray-bg border border-theme-gray-border rounded-full focus:outline-none focus:border-theme-blue focus:ring-2 focus:ring-blue-100 transition-all text-theme-black"
                />
                <Search className="w-4 h-4 text-theme-gray-medium absolute left-4 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-theme-blue text-white rounded-full text-xs font-semibold hover:bg-theme-blue-dark transition-colors shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-theme-gray-border py-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-theme-gray-medium uppercase tracking-wider border-b border-theme-gray-border">
                  Matching Products
                </div>
                {searchSuggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center px-4 py-2.5 hover:bg-theme-gray-bg transition-colors space-x-3"
                  >
                    <img
                      src={item.images[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md border border-theme-gray-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-black truncate">{item.name}</p>
                      <p className="text-xs text-theme-blue font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-theme-gray-medium" />
                  </Link>
                ))}
                <div className="p-2 border-t border-theme-gray-border bg-theme-gray-bg text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-theme-blue hover:underline"
                  >
                    View all matching results for &quot;{searchQuery}&quot;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Icons (Wishlist, Cart, Account) */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2.5 text-theme-gray-dark hover:text-theme-blue hover:bg-theme-gray-light rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-theme-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 text-theme-gray-dark hover:text-theme-blue hover:bg-theme-gray-light rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-theme-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 text-theme-black hover:text-theme-blue rounded-full border border-theme-gray-border hover:border-theme-blue transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-theme-blue text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-theme-gray-medium hidden lg:inline" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-theme-gray-border py-2 z-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-theme-gray-border">
                        <p className="text-xs font-bold text-theme-black truncate">{user.name}</p>
                        <p className="text-[11px] text-theme-gray-medium truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-theme-blue rounded text-[10px] font-bold">
                          {user.role}
                        </span>
                      </div>

                      {isStaff && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-xs font-semibold text-theme-blue hover:bg-blue-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        href="/account/orders"
                        className="flex items-center px-4 py-2 text-xs text-theme-gray-dark hover:bg-theme-gray-bg transition-colors"
                      >
                        <Package className="w-4 h-4 mr-2 text-theme-gray-medium" />
                        My Orders & Invoices
                      </Link>

                      <Link
                        href="/account/profile"
                        className="flex items-center px-4 py-2 text-xs text-theme-gray-dark hover:bg-theme-gray-bg transition-colors"
                      >
                        <UserIcon className="w-4 h-4 mr-2 text-theme-gray-medium" />
                        Profile & Addresses
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left border-t border-theme-gray-border mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-semibold text-theme-black hover:text-theme-blue rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold bg-theme-blue text-white rounded-full hover:bg-theme-blue-dark transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-between border-t border-theme-gray-border py-2 text-xs font-medium text-theme-gray-dark">
          <div className="flex items-center space-x-8">
            <Link href="/products" className="hover:text-theme-blue transition-colors font-semibold">
              All Products
            </Link>
            <Link href="/products?category=electronics" className="hover:text-theme-blue transition-colors">
              Electronics
            </Link>
            <Link href="/products?category=audio-headphones" className="hover:text-theme-blue transition-colors">
              Audio & Hi-Res
            </Link>
            <Link href="/products?category=smartphones" className="hover:text-theme-blue transition-colors">
              Smartphones
            </Link>
            <Link href="/products?category=wearables" className="hover:text-theme-blue transition-colors">
              Wearables
            </Link>
            <Link href="/products?category=fashion" className="hover:text-theme-blue transition-colors">
              Fashion & Luxury
            </Link>
            <Link href="/products?category=home-living" className="hover:text-theme-blue transition-colors">
              Modern Living
            </Link>
            <Link href="/products?flashSale=true" className="text-blue-600 font-bold hover:underline flex items-center">
              🔥 Flash Deals
            </Link>
          </div>

          <div className="flex items-center space-x-4 text-theme-gray-medium">
            <Link href="/compare" className="hover:text-theme-blue transition-colors">
              Compare Specs
            </Link>
            <Link href="/support" className="hover:text-theme-blue transition-colors">
              Help & FAQ
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-theme-gray-border px-4 py-4 space-y-4 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-theme-gray-bg border border-theme-gray-border rounded-lg"
            />
            <Search className="w-4 h-4 text-theme-gray-medium absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              All Products
            </Link>
            <Link href="/products?category=electronics" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              Electronics
            </Link>
            <Link href="/products?category=audio-headphones" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              Audio & Headphones
            </Link>
            <Link href="/products?category=smartphones" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              Smartphones
            </Link>
            <Link href="/products?category=fashion" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              Fashion
            </Link>
            <Link href="/products?flashSale=true" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border text-blue-600 font-bold">
              🔥 Flash Deals
            </Link>
            <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-theme-gray-border">
              Track Order
            </Link>
            <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="py-2">
              Help Center & Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
