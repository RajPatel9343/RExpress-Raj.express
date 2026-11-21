import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black tracking-tight">
          Official Authorized Brand Partners
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Explore products from the world&apos;s leading acoustic innovators and tech pioneers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/products?brand=${b.slug}`}
            className="group bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-theme-gray-bg rounded-2xl flex items-center justify-center font-black text-lg text-theme-blue border border-theme-gray-border">
                {b.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-theme-black group-hover:text-theme-blue transition-colors">
                  {b.name}
                </h2>
                <p className="text-xs text-theme-gray-medium mt-1 leading-relaxed">
                  {b.description || 'Authorized premium hardware manufacturer.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-theme-gray-border flex items-center justify-between text-xs">
              <span className="font-bold text-theme-blue">{b._count.products} Products</span>
              <span className="font-semibold text-theme-gray-medium group-hover:translate-x-1 transition-transform flex items-center">
                Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
