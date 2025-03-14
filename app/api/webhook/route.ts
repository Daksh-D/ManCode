// app/api/webhook/route.ts (CORRECTED - config placement)

import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import Stripe from 'stripe';

connectDB();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// This function creates an order in *your* database after a successful Stripe Checkout.
async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const orderItems = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product; // Type assertion
    return {
      productId: product.metadata?.productId || "unknown",
      name: product.name,
      quantity: item.quantity,
      price: item.price!.unit_amount! / 100,
      image:
        product.images && product.images.length > 0 ? product.images[0] : null,
      size: product.metadata?.size,
      color: product.metadata?.color,
    };
  });

  const newOrder = new Order({
    userId: session.metadata?.userId || "unknown", // Get userId from metadata
    items: orderItems,
    total: session.amount_total! / 100,
    shippingAddress: {
      street: session.shipping_details?.address?.line1, // Use optional chaining
      city: session.shipping_details?.address?.city,
      state: session.shipping_details?.address?.state,
      zip: session.shipping_details?.address?.postal_code,
      country: session.shipping_details?.address?.country,
    },
    status: "processing", // Initial order status
  });

  await newOrder.save();
}


export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string;
  let event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
     return NextResponse.json({ message: `Webhook Error: ${err.message}` }, {status: 400});
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await createOrderFromSession(session);
      console.log('Order created successfully from webhook!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// Route segment config:  ALL config options go inside this object.
export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
  runtime: 'nodejs', // Use Node.js runtime.  KEEP THIS HERE.
};

// Disable body parsing using Route Handlers:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers#opting-out-of-body-parsing