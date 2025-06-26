
"use client";

import React from 'react'; // Import React
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

// Wrap ProductGrid with React.memo
export const ProductGrid = React.memo(function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
ProductGrid.displayName = 'ProductGrid'; // Optional for easier debugging
