'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProducts(json.data || []);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (product: any) => {
    await addToCart(product.id, null, 1);
    await toggleWishlist(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-theme-black">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Review saved flagship headphones, smart wearables and luxury essentials.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-theme-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-theme-gray-border p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-theme-black">Your Wishlist is Empty</h2>
          <p className="text-xs text-theme-gray-medium max-w-sm mx-auto">
            Click the heart icon on any product to save items for future purchases or price drops.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => {
            const image = p.images && p.images[0]?.url ? p.images[0].url : 'https://via.placeholder.com/400';
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-theme-gray-border p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-200 transition-colors"
              >
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-theme-gray-bg border border-theme-gray-border">
                    <img src={image} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-white shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-theme-gray-medium uppercase tracking-wider block">
                      {p.brand?.name || p.category?.name || 'Exclusive'}
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-xs font-bold text-theme-black hover:text-theme-blue line-clamp-2 mt-0.5"
                    >
                      {p.name}
                    </Link>
                    <span className="text-sm font-black text-theme-black mt-2 block">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(p)}
                  className="w-full py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Move to Cart</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
