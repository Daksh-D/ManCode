// File: app/api/products/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectDB, Product } from '@/lib/db'; // Adjust path
import mongoose from 'mongoose';
import { z } from 'zod'; // Import Zod

connectDB();

// Zod schema for product updates (can be the same or a subset of the creation schema)
const ProductUpdateSchemaValidator = z.object({
    name: z.string().min(2).max(255),
    price: z.number().positive(),
    category: z.string().min(1),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.array(z.any()).optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
  });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {

    const id = params.id;
      if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
     }
    const data = await request.json();
    const validatedData = ProductUpdateSchemaValidator.parse(data); // Validate

    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true, // Ensure Mongoose validators also run
    });

    if (!updatedProduct) {
       return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


  export async function DELETE(request: Request, { params }: { params: { id: string } }){
      //add authentication if necessary
     try {
        const { id } = params;
        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid product ID" }, {status: 400});
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json({ message: "Product not found" }, {status: 404});
        }
        return NextResponse.json({ message: "Product deleted successfully" });
      } catch (error: any) {
        console.error("Error deleting product:", error);
         return NextResponse.json({ message: error.message }, {status: 500});
      }
}