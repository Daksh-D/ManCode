// app/admin/products/page.tsx (CORRECTED)
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

import type { Product } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/data";


export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchProducts = useCallback(async () => { // Changed
        setIsLoading(true);
        try {
            const res = await fetch('/api/products'); // Corrected
            if (!res.ok) {
                throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            setProducts(data.products); // Access the products array
        } catch (error: any) {
             toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);


     const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {  // Corrected
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Failed to delete product: ${res.status} - ${errorData.message}`
        );
      }
      fetchProducts(); //refetch after delete

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                    <TableCell>
                      <div className="relative h-10 w-10">
                        <Image
                          src={product.images?.[0] || '/placeholder-image.jpg'} // Handle missing images
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.inStock ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        In Stock
                      </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Out of Stock
                        </span>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center gap-4">
                  <Link href={`/admin/products/${product._id}`}>
                      <Button variant="outline" size="icon" >
                        <Pencil className="h-4 w-4" />
                        <span className='sr-only'>Edit</span>
                        </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product._id)} // Call handleDelete with ID
                    >
                       <Trash2 className="h-4 w-4 text-red-500" />
                       <span className="sr-only">Delete</span>
                    </Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}