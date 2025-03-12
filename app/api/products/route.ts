//File: app/api/products/route.ts
import { NextResponse } from 'next/server';
import { connectDB, Product, IProduct } from '@/lib/db'; // Adjust paths as needed
import { z } from 'zod'; // Import Zod

connectDB(); // IMPORTANT: Call connectDB() at the top level of your route handler

// Zod schema for product creation (same as before, but now co-located with the route)
const ProductSchemaValidator = z.object({
  name: z.string().min(2).max(255),
  price: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.array(z.any()).optional(), // Define a more specific schema if you have a Review type
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
        //get url params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page -1 ) * limit;

        const totalProducts = await Product.countDocuments(); // Get total count for pagination
        const products = await Product.find().skip(skip).limit(limit);

        return NextResponse.json({
        products,
        total: totalProducts,
        page,
        pages: Math.ceil(totalProducts / limit), // Calculate total pages
        });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Get data
    const validatedData = ProductSchemaValidator.parse(data); // Validate with Zod

    const newProduct = new Product(validatedData);
    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error: any) {
     if (error instanceof z.ZodError) {
        return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
     }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}