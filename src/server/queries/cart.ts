import type { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { calculateTotals, EMPTY_TOTALS, type CartTotals } from '@/lib/cart';
import { prisma } from '@/lib/db';

export const CART_COOKIE = 'wh_cart';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          inventory: true,
        },
      },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export type CartView = {
  cart: CartWithItems | null;
  totals: CartTotals;
};

export async function getCartView(): Promise<CartView> {
  const session = await auth();

  if (session?.user) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });
    return cart ? { cart, totals: totalsOf(cart) } : { cart: null, totals: EMPTY_TOTALS };
  }

  const guestId = (await cookies()).get(CART_COOKIE)?.value;
  if (!guestId) return { cart: null, totals: EMPTY_TOTALS };

  const cart = await prisma.cart.findUnique({
    where: { guestId },
    include: cartInclude,
  });
  return cart ? { cart, totals: totalsOf(cart) } : { cart: null, totals: EMPTY_TOTALS };
}

function totalsOf(cart: CartWithItems): CartTotals {
  return calculateTotals(
    cart.items.map((it) => ({ quantity: it.quantity, priceUah: it.product.priceUah })),
  );
}
