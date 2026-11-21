import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Star, Check, X, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function ComparePage() {
  // Fetch top 3 comparison candidates (e.g. Sony XM5 vs Bose Ultra, iPhone vs Apple Watch)
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      attributes: true,
      brand: true,
      category: true,
    },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black tracking-tight">
          Side-by-Side Product Comparison
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Compare specifications, acoustic drivers, hardware warranty, and customer satisfaction ratings.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-theme-gray-border">
              <th className="p-4 sm:p-6 w-1/4 bg-theme-gray-bg font-bold text-theme-black">
                Specification / Feature
              </th>
              {products.map((p) => (
                <th key={p.id} className="p-4 sm:p-6 w-1/4 align-top">
                  <div className="space-y-3">
                    <img
                      src={p.images[0]?.url || 'https://via.placeholder.com/200'}
                      alt={p.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-theme-gray-border mx-auto"
                    />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-theme-gray-medium uppercase">
                        {p.brand?.name}
                      </span>
                      <h3 className="font-bold text-theme-black text-xs sm:text-sm line-clamp-2 mt-0.5">
                        {p.name}
                      </h3>
                      <div className="text-sm font-black text-theme-blue mt-1">
                        {formatPrice(p.price)}
                      </div>
                      <Link
                        href={`/products/${p.slug}`}
                        className="inline-block mt-2 px-3 py-1.5 bg-theme-blue text-white rounded-lg text-[11px] font-bold hover:bg-theme-blue-dark"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-gray-border">
            <tr>
              <td className="p-4 font-bold bg-theme-gray-bg text-theme-black">Customer Rating</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <div className="inline-flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{p.rating.toFixed(1)} / 5</span>
                    <span className="text-gray-400 font-normal ml-1">({p.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-theme-gray-bg text-theme-black">Stock Status</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center font-bold text-green-700">
                  {p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-theme-gray-bg text-theme-black">Official Warranty</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-theme-gray-dark">
                  {p.warranty || '1 Year Brand Warranty'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-theme-gray-bg text-theme-black">Manufacturer</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-theme-gray-dark">
                  {p.manufacturer || 'Authorized Partner'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-theme-gray-bg text-theme-black">Dimensions & Weight</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-theme-gray-dark">
                  {p.dimensions ? `${p.dimensions}` : 'Standard'} {p.weight ? `(${p.weight} kg)` : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
