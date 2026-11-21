import React from 'react';
import prisma from '@/lib/prisma';
import ProductManagementTable from '@/components/admin/ProductManagementTable';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      brand: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <ProductManagementTable initialProducts={products} />;
}
