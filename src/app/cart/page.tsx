'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    couponCode,
    total,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    loading,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const shippingFee = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(inputCoupon.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponSuccess(res.message || 'Coupon applied successfully!');
      setInputCoupon('');
    } else {
      setCouponError(res.error || 'Invalid coupon code');
    }
  };

  const handleCheckoutNavigation = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black tracking-tight">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          {itemCount === 0
            ? 'Your shopping bag is currently empty'
            : `You have ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
        </p>
      </div>

      {items.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl border border-theme-gray-border p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-theme-black">Your Cart is Empty</h2>
          <p className="text-xs text-theme-gray-medium leading-relaxed">
            Looks like you haven&apos;t added any luxury headphones, smartphones or designer apparel yet.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress Indicator */}
            <div className="p-4 bg-white rounded-2xl border border-theme-gray-border shadow-sm flex items-center space-x-3 text-xs">
              <Truck className="w-5 h-5 text-theme-blue flex-shrink-0" />
              {subtotal >= 999 ? (
                <span className="text-green-700 font-bold">
                  🎉 Congratulations! Your order qualifies for Free Express Delivery!
                </span>
              ) : (
                <span className="text-theme-gray-dark">
                  Add <span className="font-bold text-theme-blue">{formatPrice(999 - subtotal)}</span> more to unlock <span className="font-bold">Free Express Delivery</span>.
                </span>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-theme-gray-border overflow-hidden shadow-sm divide-y divide-theme-gray-border">
              {items.map((item) => {
                const itemPrice = item.variant?.price ?? item.price;
                const image = item.product.images[0]?.url || 'https://via.placeholder.com/120';

                return (
                  <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Image & Title */}
                    <div className="flex items-center space-x-4">
                      <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                        <img
                          src={image}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-theme-gray-border"
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-xs sm:text-sm font-bold text-theme-black hover:text-theme-blue transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <div className="inline-block mt-1 px-2 py-0.5 bg-theme-gray-bg border border-theme-gray-border text-[11px] font-semibold text-theme-gray-dark rounded-md">
                            {item.variant.name}
                          </div>
                        )}
                        <p className="text-xs font-bold text-theme-black mt-1">
                          {formatPrice(itemPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Total */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                      <div className="flex items-center border border-theme-gray-border rounded-xl bg-theme-gray-bg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-theme-gray-dark hover:bg-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-theme-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-theme-gray-dark hover:bg-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-theme-black block">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
              <h3 className="text-base font-bold text-theme-black pb-3 border-b border-theme-gray-border">
                Order Summary
              </h3>

              {/* Coupon Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs uppercase border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !inputCoupon.trim()}
                      className="px-4 py-2 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark disabled:bg-gray-300 transition-colors shadow-sm"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-green-600 font-semibold">{couponSuccess}</p>}
                </form>

                {couponCode && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-theme-blue" />
                      <span className="font-bold">{couponCode} applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 text-xs pt-2 border-t border-theme-gray-border">
                <div className="flex justify-between text-theme-gray-dark">
                  <span>Subtotal</span>
                  <span className="font-bold text-theme-black">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-theme-gray-dark">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(shippingFee)}</span>
                </div>

                <div className="flex justify-between text-theme-gray-dark">
                  <span>Estimated Taxes (GST 18%)</span>
                  <span>Included</span>
                </div>

                <div className="pt-3 border-t border-theme-gray-border flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-theme-black">Total Payable</span>
                  <span className="text-2xl font-black text-theme-black">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutNavigation}
                className="w-full py-4 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-theme-gray-medium space-y-1">
                <div className="flex items-center justify-center space-x-1 text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>256-bit encrypted checkout powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
