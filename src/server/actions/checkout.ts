'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { emitAdminEvent } from '@/lib/event-bus';
import { generateOrderNumber } from '@/lib/order-number';
import { shippingCostUah } from '@/lib/shipping';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { checkoutSchema } from '@/lib/validation/checkout';

export type PlaceOrderState = {
  error?:
    | 'unauthorized'
    | 'invalid_input'
    | 'invalid_address'
    | 'empty_cart'
    | 'out_of_stock'
    | 'stripe_not_configured'
    | 'unknown';
  outOfStockSlug?: string;
};

export async function placeOrderAction(
  _prev: PlaceOrderState | undefined,
  formData: FormData,
): Promise<PlaceOrderState> {
  const session = await auth();
  if (!session?.user) return { error: 'unauthorized' };

  const parsed = checkoutSchema.safeParse({
    addressId: formData.get('addressId'),
    shippingMethod: formData.get('shippingMethod'),
    paymentMethod: formData.get('paymentMethod'),
  });

  if (!parsed.success) return { error: 'invalid_input' };

  if (parsed.data.paymentMethod === 'STRIPE' && !isStripeConfigured()) {
    return { error: 'stripe_not_configured' };
  }

  const address = await prisma.address.findFirst({
    where: { id: parsed.data.addressId, userId: session.user.id },
  });
  if (!address) return { error: 'invalid_address' };

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) return { error: 'empty_cart' };

  for (const item of cart.items) {
    const stock = item.product.inventory?.stock ?? 0;
    if (item.quantity > stock) {
      return { error: 'out_of_stock', outOfStockSlug: item.product.slug };
    }
  }

  const subtotalUah = cart.items.reduce(
    (sum, item) => sum + item.product.priceUah * item.quantity,
    0,
  );
  const shippingUah = shippingCostUah(parsed.data.shippingMethod);
  const totalUah = subtotalUah + shippingUah;
  const number = generateOrderNumber();

  let createdId: string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number,
          userId: session.user.id,
          status: 'PENDING',
          totalUah,
          shippingUah,
          shippingMethod: parsed.data.shippingMethod,
          paymentMethod: parsed.data.paymentMethod,
          addressId: address.id,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              priceUah: item.product.priceUah,
              quantity: item.quantity,
            })),
          },
          history: {
            create: { status: 'PENDING', comment: 'Order placed' },
          },
        },
      });

      for (const item of cart.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    createdId = order.id;

    emitAdminEvent({
      type: 'order.created',
      orderId: order.id,
      orderNumber: order.number,
      customerEmail: session.user.email ?? 'unknown',
      totalUah: order.totalUah,
      itemsCount: cart.items.length,
      createdAt: order.createdAt.toISOString(),
    });
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/account/orders');
  revalidatePath('/', 'layout');

  if (parsed.data.paymentMethod === 'STRIPE') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const stripe = getStripe();

    const lineItems: Array<{
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; images?: string[] };
      };
      quantity: number;
    }> = cart.items.map((item) => ({
      price_data: {
        currency: 'uah',
        unit_amount: item.product.priceUah,
        product_data: { name: item.product.name },
      },
      quantity: item.quantity,
    }));

    if (shippingUah > 0) {
      lineItems.push({
        price_data: {
          currency: 'uah',
          unit_amount: shippingUah,
          product_data: { name: 'Доставка' },
        },
        quantity: 1,
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: session.user.email ?? undefined,
      metadata: { orderId: createdId, orderNumber: number },
      success_url: `${appUrl}/checkout/success/${createdId}`,
      cancel_url: `${appUrl}/account/orders/${createdId}`,
    });

    if (!stripeSession.url) return { error: 'unknown' };
    redirect(stripeSession.url);
  }

  redirect(`/checkout/success/${createdId}`);
}
