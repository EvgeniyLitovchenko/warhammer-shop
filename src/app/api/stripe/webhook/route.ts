import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('Webhook not configured', { status: 503 });
  }

  const signature = (await headers()).get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const stripeSession = event.data.object;
    const orderId = stripeSession.metadata?.orderId;
    if (!orderId) {
      return new Response('Missing orderId metadata', { status: 400 });
    }

    const existing = await prisma.payment.findUnique({
      where: { providerRef: stripeSession.id },
    });
    if (existing) {
      return new Response('Already processed', { status: 200 });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'PAID',
          comment: `Stripe session ${stripeSession.id}`,
        },
      }),
      prisma.payment.create({
        data: {
          orderId,
          provider: 'stripe',
          providerRef: stripeSession.id,
          amountUah: stripeSession.amount_total ?? 0,
          status: stripeSession.payment_status ?? 'paid',
          rawPayload: stripeSession as unknown as object,
        },
      }),
    ]);
  }

  return new Response('OK', { status: 200 });
}
