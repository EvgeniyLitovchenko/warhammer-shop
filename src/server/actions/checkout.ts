'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateOrderNumber } from '@/lib/order-number';
import { shippingCostUah } from '@/lib/shipping';
import { checkoutSchema } from '@/lib/validation/checkout';

export type PlaceOrderState = {
  error?:
    | 'unauthorized'
    | 'invalid_input'
    | 'invalid_address'
    | 'empty_cart'
    | 'out_of_stock'
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
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/account/orders');
  revalidatePath('/', 'layout');
  redirect(`/checkout/success/${createdId}`);
}
