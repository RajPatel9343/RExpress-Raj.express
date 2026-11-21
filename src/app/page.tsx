import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import HeroBanner from '@/components/home/HeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight, Sparkles, Star, Tag, Award, ShieldCheck } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  // Fetch dynamic sections directly from Database
  const [featuredProducts, trendingProducts, flashSaleProducts, categories, brands] =
    await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
          brand: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isPublished: true, isTrending: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
          brand: true,
        },
        take: 8,
        orderBy: { reviewCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isPublished: true, isFlashSale: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
          brand: true,
        },
        take: 4,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      prisma.brand.findMany({
        where: { isActive: true, isFeatured: true },
        take: 6,
      }),
    ]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Flash Deals Section */}
      {flashSaleProducts.length > 0 && (
        <FlashSaleSection products={flashSaleProducts} />
      )}

      {/* Curated Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured Products Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-theme-blue uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-theme-black tracking-tight">
              Featured Flagships
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-theme-blue hover:text-theme-blue-dark flex items-center space-x-1"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Discount Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-theme-blue to-blue-800 text-white overflow-hidden p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Exclusive Welcome Offer</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Save 10% on your first order with code <span className="underline decoration-white/40">WELCOME10</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Valid across all premium flagship audio, smart wearables, and smartphones. Free express delivery guaranteed.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/products"
              className="px-8 py-4 bg-white text-theme-blue rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center space-x-2"
            >
              <span>Redeem Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending & Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-theme-blue uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Community Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-theme-black tracking-tight">
              Trending Innovations
            </h2>
          </div>
          <Link
            href="/products?trending=true"
            className="text-xs font-bold text-theme-blue hover:text-theme-blue-dark flex items-center space-x-1"
          >
            <span>View All Trending</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Brands Banner */}
      <section className="bg-white py-12 border-y border-theme-gray-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-theme-gray-medium uppercase tracking-widest mb-6">
            Official Authorized Brand Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="group flex flex-col items-center space-y-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="font-extrabold text-lg sm:text-xl text-theme-black tracking-wider group-hover:text-theme-blue transition-colors">
                  {b.name.toUpperCase()}
                </span>
                <span className="text-[10px] text-theme-gray-medium">Verified Partner</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews & Trust Score */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h3 className="text-2xl font-black text-theme-black">
              4.9 / 5 Rating from Over 10,000+ Verified Buyers
            </h3>
            <p className="text-xs text-theme-gray-medium">
              Real testimonials from tech connoisseurs across Mumbai, Bengaluru, Delhi NCR, and Hyderabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border">
              <div className="flex items-center space-x-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-theme-black font-semibold mb-1">
                &quot;The Sony XM5 headphones arrived within 24 hours!&quot;
              </p>
              <p className="text-xs text-theme-gray-dark leading-relaxed mb-3">
                Completely genuine Indian domestic warranty model with official tax invoice. Noise cancellation is unbelievable.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-theme-gray-medium">
                <span className="font-bold text-theme-black">Vikram S.</span>
                <span>•</span>
                <span className="text-green-600 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border">
              <div className="flex items-center space-x-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-theme-black font-semibold mb-1">
                &quot;Seamless Razorpay UPI checkout and packaging.&quot;
              </p>
              <p className="text-xs text-theme-gray-dark leading-relaxed mb-3">
                Applied coupon WELCOME10 and saved ₹1,000 immediately. Customer concierge answered my delivery query in minutes.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-theme-gray-medium">
                <span className="font-bold text-theme-black">Ananya D.</span>
                <span>•</span>
                <span className="text-green-600 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border">
              <div className="flex items-center space-x-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-theme-black font-semibold mb-1">
                &quot;Best place for genuine Apple & Bose gear.&quot;
              </p>
              <p className="text-xs text-theme-gray-dark leading-relaxed mb-3">
                I regularly purchase equipment for our design studio. The tracking timeline and invoice generation are super fast.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-theme-gray-medium">
                <span className="font-bold text-theme-black">Rohan M.</span>
                <span>•</span>
                <span className="text-green-600 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
