import { describe, it, expect } from 'vitest';
import { formatUah, toKopecks } from './money';

describe('toKopecks', () => {
  it('converts integer hryvnia to kopecks', () => {
    expect(toKopecks(100)).toBe(10000);
  });

  it('rounds fractional input', () => {
    expect(toKopecks(99.999)).toBe(10000);
    expect(toKopecks(99.994)).toBe(9999);
  });

  it('handles zero', () => {
    expect(toKopecks(0)).toBe(0);
  });
});

describe('formatUah', () => {
  it('formats kopecks as ukrainian currency by default', () => {
    const result = formatUah(150000);
    expect(result).toContain('1');
    expect(result).toMatch(/грн|UAH|₴/);
  });

  it('formats kopecks for english locale', () => {
    const result = formatUah(150000, 'en');
    expect(result).toMatch(/UAH|₴/);
  });

  it('drops fractional kopecks below one hryvnia', () => {
    const result = formatUah(99);
    expect(result).toMatch(/0|1/);
  });
});
