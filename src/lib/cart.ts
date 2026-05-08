export const MAX_ITEM_QUANTITY = 99;

export type CartItemTotals = {
  quantity: number;
  priceUah: number;
};

export type CartTotals = {
  totalQty: number;
  subtotalUah: number;
};

export const EMPTY_TOTALS: CartTotals = { totalQty: 0, subtotalUah: 0 };

export function calculateTotals(items: ReadonlyArray<CartItemTotals>): CartTotals {
  return items.reduce<CartTotals>(
    (acc, item) => ({
      totalQty: acc.totalQty + item.quantity,
      subtotalUah: acc.subtotalUah + item.quantity * item.priceUah,
    }),
    EMPTY_TOTALS,
  );
}

export function clampQuantity(
  requested: number,
  stock: number,
  max: number = MAX_ITEM_QUANTITY,
): number {
  if (!Number.isFinite(requested) || requested < 1) return 0;
  const ceiling = Math.max(0, Math.min(stock, max));
  return Math.min(Math.floor(requested), ceiling);
}
