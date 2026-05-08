import { beforeEach, describe, expect, it } from 'vitest';
import { authMock, cookieStoreMock, prismaMock } from '../../../vitest.setup';
import {
  addToCartAction,
  clearCartAction,
  removeFromCartAction,
  setQuantityAction,
} from './cart';

const userSession = { user: { id: 'user-1', email: 'a@b.io', role: 'CUSTOMER' as const } };

const product = {
  id: 'p1',
  slug: 'space-marines',
  status: 'ACTIVE' as const,
  name: 'Space Marines',
  inventory: { stock: 10, reserved: 0, productId: 'p1', id: 'inv-1', updatedAt: new Date() },
};

beforeEach(() => {
  authMock.mockResolvedValue(userSession);
  prismaMock.product.findUnique.mockResolvedValue(null as never);
  prismaMock.cart.upsert.mockResolvedValue({
    id: 'cart-1',
    userId: 'user-1',
    guestId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  prismaMock.cart.findUnique.mockResolvedValue(null);
  prismaMock.cartItem.findUnique.mockResolvedValue(null);
  prismaMock.cartItem.upsert.mockResolvedValue({} as never);
  prismaMock.cartItem.delete.mockResolvedValue({} as never);
  prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.$transaction.mockImplementation(
    async (cb: unknown) =>
      typeof cb === 'function' ? (cb as (tx: unknown) => unknown)(prismaMock) : cb,
  );
});

describe('addToCartAction', () => {
  it('rejects invalid quantity', async () => {
    const result = await addToCartAction({ productId: 'p1', quantity: 0 });
    expect(result).toEqual({ ok: false, error: 'invalid_quantity' });
  });

  it('rejects empty productId', async () => {
    const result = await addToCartAction({ productId: '', quantity: 1 });
    expect(result.ok).toBe(false);
  });

  it('rejects when product missing', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const result = await addToCartAction({ productId: 'missing', quantity: 1 });
    expect(result).toEqual({ ok: false, error: 'product_not_found' });
  });

  it('returns out_of_stock when stock is zero', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({
      ...product,
      inventory: { ...product.inventory, stock: 0 },
    } as never);
    const result = await addToCartAction({ productId: 'p1', quantity: 1 });
    expect(result).toEqual({ ok: false, error: 'out_of_stock' });
  });

  it('happy path inserts new cart item', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce(product as never);
    const result = await addToCartAction({ productId: 'p1', quantity: 2 });
    expect(result).toEqual({ ok: true });
    expect(prismaMock.cartItem.upsert).toHaveBeenCalled();
  });

  it('clamps quantity to remaining stock', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({
      ...product,
      inventory: { ...product.inventory, stock: 3 },
    } as never);
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'ci-1',
      cartId: 'cart-1',
      productId: 'p1',
      quantity: 2,
    });

    const result = await addToCartAction({ productId: 'p1', quantity: 5 });
    expect(result).toEqual({ ok: true, clamped: true });
  });

  it('creates a guest cookie when user is not authenticated', async () => {
    authMock.mockResolvedValueOnce(null);
    prismaMock.cart.upsert.mockResolvedValue({
      id: 'cart-guest',
      userId: null,
      guestId: 'guest-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.product.findUnique.mockResolvedValueOnce(product as never);

    await addToCartAction({ productId: 'p1', quantity: 1 });
    expect(cookieStoreMock.set).toHaveBeenCalledWith(
      'wh_cart',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
  });

  it('reuses an existing guest cookie', async () => {
    authMock.mockResolvedValueOnce(null);
    cookieStoreMock.get.mockReturnValue({ value: 'existing-guest' } as never);
    prismaMock.cart.upsert.mockResolvedValue({
      id: 'cart-existing',
      userId: null,
      guestId: 'existing-guest',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.product.findUnique.mockResolvedValueOnce(product as never);

    await addToCartAction({ productId: 'p1', quantity: 1 });
    expect(cookieStoreMock.set).not.toHaveBeenCalled();
  });

  it('merges guest cart into user cart on first authed access', async () => {
    cookieStoreMock.get.mockReturnValue({ value: 'guest-uuid' } as never);
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-guest',
      userId: null,
      guestId: 'guest-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [{ id: 'gi-1', cartId: 'cart-guest', productId: 'p2', quantity: 2 }],
    } as never);
    prismaMock.cart.delete.mockResolvedValue({} as never);
    prismaMock.product.findUnique.mockResolvedValueOnce(product as never);

    await addToCartAction({ productId: 'p1', quantity: 1 });
    expect(prismaMock.cart.delete).toHaveBeenCalled();
    expect(cookieStoreMock.delete).toHaveBeenCalledWith('wh_cart');
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 0])(
    'rejects %s as invalid quantity',
    async (qty) => {
      const result = await addToCartAction({ productId: 'p1', quantity: qty });
      expect(result.ok).toBe(false);
    },
  );
});

describe('setQuantityAction', () => {
  beforeEach(() => {
    prismaMock.product.findUnique.mockResolvedValue(product as never);
  });

  it('deletes the item when quantity is 0', async () => {
    const result = await setQuantityAction({ productId: 'p1', quantity: 0 });
    expect(result.ok).toBe(true);
    expect(prismaMock.cartItem.delete).toHaveBeenCalled();
  });

  it('rejects non-finite quantity', async () => {
    const result = await setQuantityAction({ productId: 'p1', quantity: Number.NaN });
    expect(result).toEqual({ ok: false, error: 'invalid_quantity' });
  });

  it('upserts updated quantity', async () => {
    const result = await setQuantityAction({ productId: 'p1', quantity: 3 });
    expect(result.ok).toBe(true);
  });

  it('clamps quantity above stock', async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      ...product,
      inventory: { ...product.inventory, stock: 2 },
    } as never);

    const result = await setQuantityAction({ productId: 'p1', quantity: 99 });
    expect(result).toEqual({ ok: true, clamped: true });
  });

  it('rejects when product not found', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const result = await setQuantityAction({ productId: 'p1', quantity: 3 });
    expect(result).toEqual({ ok: false, error: 'product_not_found' });
  });
});

describe('removeFromCartAction', () => {
  it('rejects empty productId', async () => {
    const result = await removeFromCartAction({ productId: '' });
    expect(result.ok).toBe(false);
  });

  it('deletes by composite key', async () => {
    const result = await removeFromCartAction({ productId: 'p1' });
    expect(result.ok).toBe(true);
    expect(prismaMock.cartItem.delete).toHaveBeenCalled();
  });
});

describe('clearCartAction', () => {
  it('deletes all items for an authed user', async () => {
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 3 });
    const result = await clearCartAction();
    expect(result.ok).toBe(true);
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cart: { userId: 'user-1' } },
    });
  });

  it('returns ok when guest has no cookie', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await clearCartAction();
    expect(result.ok).toBe(true);
  });

  it('deletes by guestId when guest has cookie', async () => {
    authMock.mockResolvedValueOnce(null);
    cookieStoreMock.get.mockReturnValue({ value: 'guest-uuid' } as never);
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    await clearCartAction();
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cart: { guestId: 'guest-uuid' } },
    });
  });
});
