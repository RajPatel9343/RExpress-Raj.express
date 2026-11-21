'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Check, AlertCircle } from 'lucide-react';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    rating: number;
    reviewCount: number;
    isFlashSale?: boolean;
    images: { url: string; alt?: string | null }[];
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const discountPercent = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images[0]?.url || 'https://via.placeholder.com/400';
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product.id, null, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlistLoading) return;
    setWishlistLoading(true);
    await toggleWishlist(product.id);
    setWishlistLoading(false);
  };

  return (
    <div className="group relative bg-white border border-theme-gray-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
      {/* Badges & Wishlist Trigger */}
      <div className="relative aspect-square w-full bg-theme-gray-bg overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 bg-theme-blue text-white text-[11px] font-bold rounded-md shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFlashSale && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
              Deal
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-md">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 bg-gray-800 text-white text-[11px] font-bold rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            inWishlist
              ? 'bg-red-50 text-red-500 shadow-md scale-110'
              : 'bg-white/80 text-theme-gray-medium hover:text-red-500 hover:bg-white shadow-sm'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand or Category */}
          <div className="text-[11px] font-semibold text-theme-gray-medium uppercase tracking-wider mb-1">
            {product.brand?.name || product.category?.name || 'Exclusive'}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-theme-black group-hover:text-theme-blue transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold ml-1 text-theme-black">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-theme-gray-medium">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-theme-gray-border flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-theme-black">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-theme-gray-medium line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-green-600 font-medium">Free Delivery</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`p-2.5 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
              added
                ? 'bg-green-600 text-white'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-theme-blue text-white hover:bg-theme-blue-dark shadow-sm hover:shadow'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Quick Add to Cart'}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : adding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
