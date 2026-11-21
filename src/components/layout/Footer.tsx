'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, CheckCircle, Shield, CreditCard, RefreshCw, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setError('');
        setEmail('');
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <footer className="bg-theme-black text-gray-300 pt-16 pb-12 border-t border-theme-gray-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-theme-blue text-white rounded-lg flex items-center justify-center font-bold text-lg">
                R
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white">
                Rexpresso
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              India&apos;s premier commercial destination for authentic luxury tech, studio acoustics,
              and designer accessories. Curated for performance, craftsmanship, and reliability.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Rexpresso Tower, Level 8, MG Road, Bengaluru, KA 560001</span>              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Helpline: +91 (080) 4567-8900 (Mon - Sat, 9 AM - 8 PM IST)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>concierge@rexpresso.com</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1">
                GSTIN: <span className="font-mono text-gray-400">29AABCU9603R1ZM</span> | Registered Corporate Entity
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=electronics" className="hover:text-blue-400 transition-colors">
                  Flagship Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio-headphones" className="hover:text-blue-400 transition-colors">
                  Audio & Headphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=smartphones" className="hover:text-blue-400 transition-colors">
                  Smartphones & Tech
                </Link>
              </li>
              <li>
                <Link href="/products?category=wearables" className="hover:text-blue-400 transition-colors">
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="hover:text-blue-400 transition-colors">
                  Luxury Fashion & Shoes
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-living" className="hover:text-blue-400 transition-colors">
                  Modern Living & Air Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-blue-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-blue-400 transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-blue-400 transition-colors">
                  Shipping & Dispatch Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors">
                  Concierge Support Desk
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy & Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Exclusive Access</h4>
            <p className="text-xs text-gray-400">
              Receive confidential member discounts, invitations to product drops, and ₹1,000 off your initial order.
            </p>
            {subscribed ? (
              <div className="p-3 bg-blue-950/60 border border-blue-500/40 rounded-lg text-xs text-blue-300 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>You are subscribed to Rexpresso VIP privileges.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-theme-blue text-white rounded-md text-xs hover:bg-theme-blue-dark transition-colors flex items-center"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                {error && <p className="text-[11px] text-red-400">{error}</p>}
              </form>
            )}
            <div className="pt-2 text-[11px] text-gray-500">
              Strict zero-spam policy. Unsubscribe anytime with 1 click.
            </div>
          </div>
        </div>

        {/* Bottom Bar: Trust Seals & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Razorpay 256-Bit SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>UPI / RuPay / Cards / COD</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <span>7-Day Return Guarantee</span>
            </div>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Rexpresso Commerce India Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
