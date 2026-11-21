import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailView from '@/components/products/ProductDetailView';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    select: { name: true, shortDescription: true, description: true },
  });

  if (!product) {
    return { title: 'Product Not Found | Rexpresso' };
  }

  return {
    title: `${product.name} | Rexpresso`,
    description: product.shortDescription || product.description.substring(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      isPublished: true,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      brand: true,
      variants: { orderBy: { price: 'asc' } },
      attributes: true,
      reviews: {
        where: { isApproved: true },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isPublished: true,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      brand: true,
      category: true,
    },
    take: 4,
  });

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
