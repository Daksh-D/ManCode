// app/api/products/search/route.ts
import { NextResponse } from 'next/server';
import { connectDB, Product } from '@/lib/db';


connectDB();

export const dynamic = 'force-dynamic'; // ADD THIS LINE

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url) // Use searchParams directly
    const q = searchParams.get('q');

    if (typeof q !== "string") {
      return NextResponse.json({ message: 'Query parameter "q" must be a string' }, { status: 400 });
    }
    const query = new RegExp(q, 'i'); // 'i' for case-insensitive
    const products = await Product.find({
      $or: [
        { name: query },
        { description: query },
        { category: query },
        // Add other fields to search as needed
      ],
    });
    return NextResponse.json(products);

  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}