import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await processPayment(paymentIntent.metadata, paymentIntent.id, paymentIntent.amount);
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await processPayment(session.metadata || {}, session.payment_intent as string, session.amount_total || 0);
    }
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function processPayment(metadata: Stripe.Metadata, paymentId: string, amountCents: number) {
  // Handle Booking
  if (metadata.booking_id) {
    await handleBookingPayment(paymentId, metadata.booking_id);
  }

  // Handle Cart Items
  if (metadata.cart_items) {
    await handleCartPurchase(paymentId, metadata.cart_items, amountCents);
  }
}

async function handleCartPurchase(paymentId: string, cartItemsStr: string, amountCents: number) {
  let cartItems: { id: string; quantity: number }[];
  try {
    cartItems = JSON.parse(cartItemsStr);
  } catch {
    console.error('Failed to parse cart_items');
    return;
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    console.error('Invalid cart_items');
    return;
  }

  const productIds = cartItems.map(item => item.id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds);

  if (productsError || !products) {
    console.error('Failed to fetch products:', productsError);
    return;
  }

  const orderItems = cartItems.map(item => {
    const product = products.find(p => p.id === item.id);
    return {
      product_id: item.id,
      product_name: product?.name || 'Unknown',
      quantity: item.quantity,
      price: product?.price || 0,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_payment_id: paymentId,
      amount: amountCents / 100,
      status: 'completed',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError);
    return;
  }

  // Log Audit for Purchase
  await supabase.from('audits').insert({
    action: 'PURCHASE',
    entity_type: 'order',
    entity_id: order.id,
    metadata: {
      amount: amountCents / 100,
      payment_id: paymentId,
      items: orderItems,
      type: 'cart_purchase'
    }
  });

  const orderItemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsWithOrderId);

  if (itemsError) {
    console.error('Failed to create order items:', itemsError);
  }

  console.log('Cart purchase order created:', order.id);
}

async function handleBookingPayment(paymentId: string, bookingId: string) {
  const { data: booking, error: bookingFetchError } = await supabase
    .from('bookings')
    .select('user_id, total_amount, payment_status')
    .eq('id', bookingId)
    .single();

  if (bookingFetchError || !booking) {
    console.error('Booking not found:', bookingId);
    return;
  }

  if (booking.payment_status === 'paid') {
    console.log('Booking already paid, skipping:', bookingId);
    return;
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      booking_id: bookingId,
      user_id: booking.user_id,
      stripe_payment_id: paymentId,
      amount: booking.total_amount,
      status: 'succeeded',
    });

  if (paymentError) {
    console.error('Failed to insert payment record:', paymentError);
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', bookingId);

  if (updateError) {
    console.error('Failed to update booking:', updateError);
  }

  // Log Audit for Booking Payment
  await supabase.from('audits').insert({
    action: 'PURCHASE',
    entity_type: 'booking',
    entity_id: bookingId,
    metadata: {
      amount: booking.total_amount,
      payment_id: paymentId,
      user_id: booking.user_id,
      type: 'booking_payment'
    }
  });

  console.log('Booking payment confirmed:', bookingId);
}
