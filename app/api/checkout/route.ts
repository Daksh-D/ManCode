//File: app/api/checkout/route.ts

import { NextResponse } from 'next/server';
import { connectDB, Order} from '@/lib/db';
import Stripe from "stripe";
import { headers } from 'next/headers';


connectDB();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});


export async function POST(request: Request) {
    try {
      const { items } = await request.json();
      const headersList = headers();
      const userId = headersList.get('x-user-id');

      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId,
              size: item.size,
              color: item.color,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        metadata: { userId: userId },
      });
      return NextResponse.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      return NextResponse.json({ error: error.message }, {status: 500});
    }
  }