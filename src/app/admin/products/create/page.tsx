'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.success) setCategories(cData.data || []);
        }
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.success) setBrands(bData.data || []);
        }
      } catch (err) {}
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      setError('Product title, SKU and price are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku,
          description,
          shortDescription,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          stock: parseInt(stock),
          categoryId: categoryId || null,
          brandId: brandId || null,
          isFeatured,
          isTrending,
          isFlashSale,
          images: imageUrl ? [{ url: imageUrl.trim() }] : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err: any) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="text-xs text-theme-blue font-bold flex items-center space-x-1 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product List</span>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Create New Luxury Product
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Add specifications, inventory tiers, pricing, and high-resolution imagery.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-theme-black block mb-1">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bang & Olufsen Beoplay H95 Flagship Headphones"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">SKU Code *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. BNO-H95-GLD"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Initial Stock Count *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 74900"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Compare at / MRP (₹)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="e.g. 84900"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-theme-black block mb-1">Primary Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-theme-black block mb-1">Short Feature Summary</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise 1-line headline for product listing cards..."
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-theme-black block mb-1">Comprehensive Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed specifications, acoustic materials, dimensions, and craftsmanship..."
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
            </div>
          </div>

          {/* Visibility Badges */}
          <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex flex-wrap gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-theme-blue focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-theme-black">Featured on Homepage</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="rounded text-theme-blue focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-theme-black">Mark as Trending</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="rounded text-theme-blue focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-theme-black">Include in Flash Deals</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 border border-theme-gray-border rounded-xl text-theme-gray-dark font-semibold hover:bg-theme-gray-bg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-400"
            >
              {submitting ? 'Creating Product...' : 'Publish Product to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
