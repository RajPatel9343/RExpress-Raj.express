import React from 'react';
import prisma from '@/lib/prisma';
import { Layers, Plus, CheckCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Category & Department Tree
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Organize catalog taxonomies, subcategories, and storefront navigation tiers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-theme-gray-border p-6 shadow-sm space-y-3 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-theme-black">{c.name}</span>
              <span className="text-[11px] font-bold text-theme-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                {c._count.products} Products
              </span>
            </div>

            <p className="text-xs text-theme-gray-medium line-clamp-2">
              {c.description || 'Department taxonomy'}
            </p>

            <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-theme-gray-border">
              Slug: /{c.slug}
            </div>

            {c.children && c.children.length > 0 && (
              <div className="pt-2 text-xs">
                <span className="text-[10px] font-bold text-theme-gray-medium uppercase tracking-wider block mb-1">
                  Subcategories ({c.children.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.children.map((sub: any) => (
                    <span
                      key={sub.id}
                      className="px-2 py-0.5 bg-theme-gray-bg rounded text-[11px] font-medium text-theme-black"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
