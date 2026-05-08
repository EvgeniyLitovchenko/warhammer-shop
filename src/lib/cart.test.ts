import { describe, it, expect } from 'vitest';
import { calculateTotals, clampQuantity, EMPTY_TOTALS, MAX_ITEM_QUANTITY } from './cart';

describe('calculateTotals', () => {
  it('returns empty totals for empty input', () => {
    expect(calculateTotals([])).toEqual(EMPTY_TOTALS);
  });

  it('sums quantities and prices', () => {
    expect(
      calculateTotals([
        { quantity: 2, priceUah: 15000 },
        { quantity: 1, priceUah: 250000 },
        { quantity: 3, priceUah: 5000 },
      ]),
    ).toEqual({ totalQty: 6, subtotalUah: 2 * 15000 + 250000 + 3 * 5000 });
  });

  it('handles a single line', () => {
    expect(calculateTotals([{ quantity: 4, priceUah: 100 }])).toEqual({
      totalQty: 4,
      subtotalUah: 400,
    });
  });
});

describe('clampQuantity', () => {
  it('clamps to stock', () => {
    expect(clampQuantity(10, 3)).toBe(3);
  });

  it('clamps to global max', () => {
    expect(clampQuantity(500, 1000)).toBe(MAX_ITEM_QUANTITY);
  });

  it('uses requested when below stock and max', () => {
    expect(clampQuantity(5, 50)).toBe(5);
  });

  it('returns 0 for zero or negative', () => {
    expect(clampQuantity(0, 10)).toBe(0);
    expect(clampQuantity(-3, 10)).toBe(0);
  });

  it('returns 0 when out of stock', () => {
    expect(clampQuantity(5, 0)).toBe(0);
  });

  it('rejects non-finite numbers', () => {
    expect(clampQuantity(Number.NaN, 10)).toBe(0);
    expect(clampQuantity(Number.POSITIVE_INFINITY, 10)).toBe(0);
  });

  it('floors fractional input', () => {
    expect(clampQuantity(3.9, 10)).toBe(3);
  });

  it('respects custom max override', () => {
    expect(clampQuantity(99, 99, 5)).toBe(5);
  });
});
