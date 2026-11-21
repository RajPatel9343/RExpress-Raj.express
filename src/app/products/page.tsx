import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/products/ProductCard';
import { Filter, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
    featured?: string;
    trending?: string;
    flashSale?: string;
    q?: string;
    page?: string;
  };
}

export const revalidate = 30;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categorySlug = searchParams.category;
  const brandSlug = searchParams.brand;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const sort = searchParams.sort || 'featured';
  const inStock = searchParams.inStock === 'true';
  const query = searchParams.q;
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build where conditions
  const where: any = {
    isPublished: true,
  };

  if (categorySlug) {
    where.OR = [
      { category: { slug: categorySlug } },
      { category: { parent: { slug: categorySlug } } },
    ];
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  if (searchParams.featured === 'true') where.isFeatured = true;
  if (searchParams.trending === 'true') where.isTrending = true;
  if (searchParams.flashSale === 'true') where.isFlashSale = true;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } },
          { tags: { contains: q } },
          { brand: { name: { contains: q } } },
        ],
      },
    ];
  }

  // Determine sorting
  let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price-desc') orderBy = { price: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'popular') orderBy = { reviewCount: 'desc' };

  // Fetch products, categories, and brands in parallel
  const [products, totalCount, allCategories, allBrands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        brand: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Helper to construct query string
  const createQueryUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (brandSlug) params.set('brand', brandSlug);
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
    if (sort) params.set('sort', sort);
    if (inStock) params.set('inStock', 'true');
    if (query) params.set('q', query);

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    return `/products?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs text-theme-gray-medium mb-2">
          <Link href="/" className="hover:text-theme-blue">
            Home
          </Link>
          <span>/</span>
          <span className="text-theme-black font-semibold">Catalog</span>
          {categorySlug && (
            <>
              <span>/</span>
              <span className="text-theme-blue font-semibold capitalize">
                {categorySlug.replace('-', ' ')}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black">
              {query ? `Search Results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-xs text-theme-gray-medium mt-1">
              Showing {products.length} of {totalCount} verified items
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-theme-gray-medium font-medium">Sort by:</span>
            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { label: 'Featured', val: 'featured' },
                { label: 'Price: Low to High', val: 'price-asc' },
                { label: 'Price: High to Low', val: 'price-desc' },
                { label: 'Newest', val: 'newest' },
                { label: 'Rating', val: 'rating' },
              ].map((s) => (
                <Link
                  key={s.val}
                  href={createQueryUrl({ sort: s.val, page: '1' })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    sort === s.val
                      ? 'bg-theme-blue text-white border-theme-blue shadow-sm'
                      : 'bg-white text-theme-gray-dark border-theme-gray-border hover:border-theme-blue'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-theme-gray-border shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
              <div className="flex items-center space-x-2 text-sm font-bold text-theme-black">
                <SlidersHorizontal className="w-4 h-4 text-theme-blue" />
                <span>Filter Products</span>
              </div>
              <Link
                href="/products"
                className="text-[11px] text-theme-gray-medium hover:text-red-500 flex items-center space-x-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Link>
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold text-theme-black uppercase tracking-wider mb-3">
                Categories
              </h4>
              <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                <Link
                  href={createQueryUrl({ category: undefined, page: '1' })}
                  className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                    !categorySlug
                      ? 'bg-blue-50 text-theme-blue font-bold'
                      : 'text-theme-gray-dark hover:bg-theme-gray-bg'
                  }`}
                >
                  All Categories
                </Link>
                {allCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={createQueryUrl({ category: c.slug, page: '1' })}
                    className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                      categorySlug === c.slug
                        ? 'bg-blue-50 text-theme-blue font-bold'
                        : 'text-theme-gray-dark hover:bg-theme-gray-bg'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-4 border-t border-theme-gray-border">
              <h4 className="text-xs font-bold text-theme-black uppercase tracking-wider mb-3">
                Brands
              </h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                <Link
                  href={createQueryUrl({ brand: undefined, page: '1' })}
                  className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                    !brandSlug
                      ? 'bg-blue-50 text-theme-blue font-bold'
                      : 'text-theme-gray-dark hover:bg-theme-gray-bg'
                  }`}
                >
                  All Brands
                </Link>
                {allBrands.map((b) => (
                  <Link
                    key={b.id}
                    href={createQueryUrl({ brand: b.slug, page: '1' })}
                    className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                      brandSlug === b.slug
                        ? 'bg-blue-50 text-theme-blue font-bold'
                        : 'text-theme-gray-dark hover:bg-theme-gray-bg'
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-theme-gray-border">
              <h4 className="text-xs font-bold text-theme-black uppercase tracking-wider mb-3">
                Price Range (₹)
              </h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Under ₹15,000', min: undefined, max: '15000' },
                  { label: '₹15,000 - ₹35,000', min: '15000', max: '35000' },
                  { label: '₹35,000 - ₹75,000', min: '35000', max: '75000' },
                  { label: 'Above ₹75,000', min: '75000', max: undefined },
                ].map((range, idx) => (
                  <Link
                    key={idx}
                    href={createQueryUrl({ minPrice: range.min, maxPrice: range.max, page: '1' })}
                    className="block px-2.5 py-1.5 rounded-lg text-theme-gray-dark hover:bg-theme-gray-bg transition-colors"
                  >
                    {range.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div className="pt-4 border-t border-theme-gray-border">
              <Link
                href={createQueryUrl({ inStock: inStock ? undefined : 'true', page: '1' })}
                className="flex items-center space-x-2 text-xs font-semibold text-theme-black cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={inStock}
                  readOnly
                  className="rounded text-theme-blue focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>In Stock Only</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-theme-gray-border p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-theme-black">No products matched your criteria</h3>
              <p className="text-xs text-theme-gray-medium max-w-md mx-auto">
                Try loosening your filters, adjusting the price boundaries, or exploring other popular categories.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
              >
                View All Products
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6 border-t border-theme-gray-border">
                  {page > 1 && (
                    <Link
                      href={createQueryUrl({ page: (page - 1).toString() })}
                      className="p-2 rounded-lg border border-theme-gray-border hover:bg-white text-theme-black"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  )}

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    return (
                      <Link
                        key={p}
                        href={createQueryUrl({ page: p.toString() })}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          p === page
                            ? 'bg-theme-blue text-white shadow-sm'
                            : 'bg-white border border-theme-gray-border text-theme-black hover:border-theme-blue'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {page < totalPages && (
                    <Link
                      href={createQueryUrl({ page: (page + 1).toString() })}
                      className="p-2 rounded-lg border border-theme-gray-border hover:bg-white text-theme-black"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
