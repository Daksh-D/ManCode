// app/products/[id]/page.tsx

import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import ProductDetails from './ProductDetails'; // Client Component

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}`, { cache: 'no-store' }); // Corrected

  if (!res.ok) {
    if (res.status === 404) {
        return null; // Product not found.
    } else {
       throw new Error(`Failed to fetch product: ${res.status}`);
    }
  }
  return res.json();
}


export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.id);

  if (!product) {
    notFound(); // Now, notFound() is called correctly
  }

  // Only pass data to the client component
  return <ProductDetails product={product} />;
}