import { describe, it, expect } from 'vitest';
import { generateOrderNumber, isOrderNumber } from './order-number';

describe('generateOrderNumber', () => {
  it('uses provided date', () => {
    const date = new Date(2026, 4, 8); // 2026-05-08
    const number = generateOrderNumber(date);
    expect(number.startsWith('WH-260508-')).toBe(true);
  });

  it('produces a value matching the order number pattern', () => {
    expect(isOrderNumber(generateOrderNumber())).toBe(true);
  });

  it('produces unique values across many generations', () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i += 1) set.add(generateOrderNumber());
    expect(set.size).toBeGreaterThan(190);
  });

  it('zero-pads single-digit months and days', () => {
    const date = new Date(2026, 0, 3); // Jan 3, 2026
    expect(generateOrderNumber(date)).toMatch(/^WH-260103-/);
  });
});

describe('isOrderNumber', () => {
  it('accepts well-formed numbers', () => {
    expect(isOrderNumber('WH-260508-A3F9')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isOrderNumber('foo')).toBe(false);
    expect(isOrderNumber('WH-260508-A3F')).toBe(false);
    expect(isOrderNumber('WH-2605-A3F9')).toBe(false);
    expect(isOrderNumber('WH-260508-XYZW')).toBe(false);
  });
});
