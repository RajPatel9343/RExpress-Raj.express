import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryGridProps {
  categories: any[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-theme-gray-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-black tracking-tight">
              Featured Collections
            </h2>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Explore meticulously curated luxury technology & lifestyle departments
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-theme-blue hover:text-theme-blue-dark flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden border border-theme-gray-border hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={cat.image || 'https://via.placeholder.com/300'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="p-3 text-center bg-white flex-1 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-theme-black group-hover:text-theme-blue transition-colors truncate">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-theme-gray-medium mt-0.5">
                  {cat._count?.products ?? 0} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
