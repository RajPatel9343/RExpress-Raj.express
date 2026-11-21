import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Layers, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black tracking-tight">
          All Product Departments & Collections
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Explore our complete taxonomy of flagship electronics, acoustic gear, and designer lifestyle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-theme-gray-border overflow-hidden shadow-sm hover:border-blue-200 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <img
                  src={cat.image || 'https://via.placeholder.com/600x300'}
                  alt={cat.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-theme-black">{cat.name}</h2>
                  <span className="text-[11px] font-bold text-theme-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {cat._count.products} Products
                  </span>
                </div>
                <p className="text-xs text-theme-gray-dark leading-relaxed">
                  {cat.description || 'Explore our latest luxury inventory.'}
                </p>

                {cat.children && cat.children.length > 0 && (
                  <div className="pt-3 border-t border-theme-gray-border space-y-1">
                    <span className="text-[10px] font-bold text-theme-gray-medium uppercase tracking-wider block">
                      Subcategories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.children.map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          className="px-2.5 py-1 bg-theme-gray-bg hover:bg-blue-50 hover:text-theme-blue text-theme-black rounded-lg text-[11px] font-medium transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={`/products?category=${cat.slug}`}
                className="w-full py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center justify-center space-x-1.5"
              >
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
