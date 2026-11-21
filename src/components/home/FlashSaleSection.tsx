'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

interface FlashSaleSectionProps {
  products: any[];
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  // 48 hours countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-gray-border gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-theme-black tracking-tight">
                Flash Deals & Limited Drops
              </h2>
              <p className="text-xs text-theme-gray-medium mt-0.5">
                Exclusive prices reserved for the current 24-hour cycle.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs font-semibold text-theme-gray-dark mr-2">
              <Clock className="w-4 h-4 text-theme-blue" />
              <span>Ends in:</span>
            </div>
            <div className="flex items-center space-x-1.5 text-white font-mono text-xs font-bold">
              <div className="bg-theme-black px-2.5 py-1.5 rounded-lg shadow-sm">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span className="text-theme-black font-extrabold">:</span>
              <div className="bg-theme-black px-2.5 py-1.5 rounded-lg shadow-sm">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span className="text-theme-black font-extrabold">:</span>
              <div className="bg-theme-blue px-2.5 py-1.5 rounded-lg shadow-sm">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Deals button */}
        <div className="mt-8 text-center">
          <Link
            href="/products?flashSale=true"
            className="inline-flex items-center space-x-2 text-xs font-bold text-theme-blue hover:text-theme-blue-dark transition-colors border border-blue-200 px-5 py-2.5 rounded-full hover:bg-blue-50"
          >
            <span>Explore All Flash Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
