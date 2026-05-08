'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { clampQuantity } from '@/lib/cart';
import { prisma } from '@/lib/db';
import { CART_COOKIE } from '@/server/queries/cart';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type CartActionResult =
  | { ok: true; clamped?: boolean }
  | {
      ok: false;
      error: 'product_not_found' | 'out_of_stock' | 'invalid_quantity' | 'no_cart' | 'unknown';
    };

async function resolveCartId(): Promise<string> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user) {
    const userCart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    const guestId = cookieStore.get(CART_COOKIE)?.value;
    if (guestId) {
      await mergeGuestCart(guestId, userCart.id);
      cookieStore.delete(CART_COOKIE);
    }

    return userCart.id;
  }

  let guestId = cookieStore.get(CART_COOKIE)?.value;
  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE, guestId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  const guestCart = await prisma.cart.upsert({
    where: { guestId },
    update: {},
    create: { guestId },
  });
  return guestCart.id;
}

async function mergeGuestCart(guestId: string, userCartId: string): Promise<void> {
  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: { items: true },
  });
  if (!guestCart || guestCart.id === userCartId) return;

  await prisma.$transaction(async (tx) => {
    for (const item of guestCart.items) {
      await tx.cartItem.upsert({
        where: {
          cartId_productId: { cartId: userCartId, productId: item.productId },
        },
        update: { quantity: { increment: item.quantity } },
        create: { cartId: userCartId, productId: item.productId, quantity: item.quantity },
      });
    }
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}

function done(extra?: { clamped?: boolean }): CartActionResult {
  revalidatePath('/', 'layout');
  return { ok: true, ...(extra?.clamped ? { clamped: true } : {}) };
}

export async function addToCartAction({
  productId,
  quantity = 1,
}: {
  productId: string;
  quantity?: number;
}): Promise<CartActionResult> {
  if (!productId || !Number.isFinite(quantity) || quantity < 1) {
    return { ok: false, error: 'invalid_quantity' };
  }

  const product = await prisma.product.findUnique({
    where: { slug: productId },
    include: { inventory: true },
  });
  const found =
    product ??
    (await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    }));

  if (!found || found.status !== 'ACTIVE') {
    return { ok: false, error: 'product_not_found' };
  }

  const stock = found.inventory?.stock ?? 0;
  if (stock <= 0) return { ok: false, error: 'out_of_stock' };

  const cartId = await resolveCartId();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId: found.id } },
  });

  const desired = (existing?.quantity ?? 0) + Math.floor(quantity);
  const finalQty = clampQuantity(desired, stock);
  if (finalQty === 0) return { ok: false, error: 'out_of_stock' };

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId: found.id } },
    update: { quantity: finalQty },
    create: { cartId, productId: found.id, quantity: finalQty },
  });

  return done({ clamped: finalQty < desired });
}

export async function setQuantityAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartActionResult> {
  if (!productId || !Number.isFinite(quantity)) {
    return { ok: false, error: 'invalid_quantity' };
  }

  const cartId = await resolveCartId();

  if (quantity <= 0) {
    await prisma.cartItem
      .delete({ where: { cartId_productId: { cartId, productId } } })
      .catch(() => null);
    return done();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });
  if (!product || product.status !== 'ACTIVE') {
    return { ok: false, error: 'product_not_found' };
  }

  const stock = product.inventory?.stock ?? 0;
  const finalQty = clampQuantity(quantity, stock);
  if (finalQty === 0) {
    await prisma.cartItem
      .delete({ where: { cartId_productId: { cartId, productId } } })
      .catch(() => null);
    return done({ clamped: true });
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    update: { quantity: finalQty },
    create: { cartId, productId, quantity: finalQty },
  });

  return done({ clamped: finalQty < Math.floor(quantity) });
}

export async function removeFromCartAction({
  productId,
}: {
  productId: string;
}): Promise<CartActionResult> {
  if (!productId) return { ok: false, error: 'invalid_quantity' };
  const cartId = await resolveCartId();
  await prisma.cartItem
    .delete({ where: { cartId_productId: { cartId, productId } } })
    .catch(() => null);
  return done();
}

export async function clearCartAction(): Promise<CartActionResult> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: session.user.id } } });
    return done();
  }

  const guestId = cookieStore.get(CART_COOKIE)?.value;
  if (!guestId) return done();
  await prisma.cartItem.deleteMany({ where: { cart: { guestId } } });
  return done();
}
