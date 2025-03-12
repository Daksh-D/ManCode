//File: app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { connectDB, Cart } from '@/lib/db'; // Adjust paths as needed
import { headers } from 'next/headers';
connectDB(); // IMPORTANT: Call connectDB() at the top level of your route handler


export async function GET(request: Request) {
    try {
      // Get user ID from headers (set by middleware)
        const headersList = headers();
        const userId = headersList.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

      const cart = await Cart.findOne({ userId });
      return NextResponse.json(cart ? cart.items : []);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
  export async function POST(request: Request) {
    try {
        const headersList = headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

      const { items } = await request.json();
      let cart = await Cart.findOne({ userId });

      if (cart) {
        cart.items = items;
        cart.updatedAt = new Date();
        await cart.save();
      } else {
        cart = new Cart({ userId, items });
        await cart.save();
      }

      return NextResponse.json(cart.items);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }