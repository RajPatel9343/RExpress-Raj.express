import React from 'react';
import ProductsPage from '../products/page';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return <ProductsPage searchParams={searchParams} />;
}
