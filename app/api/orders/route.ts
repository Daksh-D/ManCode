//File: app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { headers } from 'next/headers';

connectDB();

export async function GET(request: Request) {
    try {
      // Get user ID from headers (set by middleware)
        const headersList = headers();
        const userId = headersList.get('x-user-id');
        const userRole = headersList.get("x-user-role");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        //for admin user
        if(userRole === "admin"){
            const orders = await Order.find().sort({ createdAt: -1 });
            return NextResponse.json(orders);

        } else { //for normal user
             const orders = await Order.find({userId}).sort({ createdAt: -1 });
            return NextResponse.json(orders);
        }

    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }