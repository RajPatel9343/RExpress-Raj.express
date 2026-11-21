'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, AlertCircle, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductManagementTableProps {
  initialProducts: any[];
}

export default function ProductManagementTable({ initialProducts }: ProductManagementTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      alert('Network error while deleting product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Product Catalog Management
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Manage inventory, pricing, specifications, variants, and SEO configurations.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-theme-gray-border shadow-sm flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
          />
          <Search className="w-4 h-4 text-theme-gray-medium absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-theme-gray-medium">
          Showing {filtered.length} products
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {filtered.map((prod) => {
                const img = prod.images[0]?.url || 'https://via.placeholder.com/80';
                return (
                  <tr key={prod.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-theme-gray-border flex-shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-theme-black line-clamp-1 block">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-theme-gray-medium">
                            {prod.brand?.name || 'Exclusive Partner'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-theme-gray-dark">{prod.sku}</td>
                    <td className="p-4 text-theme-gray-dark">{prod.category?.name || '—'}</td>
                    <td className="p-4 font-extrabold text-theme-black">{formatPrice(prod.price)}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          prod.stock <= 5 ? 'text-red-600' : 'text-theme-black'
                        }`}
                      >
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-bold">
                        Published
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-theme-blue rounded-lg"
                          title="View on site"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          disabled={deletingId === prod.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
