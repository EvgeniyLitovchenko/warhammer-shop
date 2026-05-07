import { describe, it, expect } from 'vitest';
import { pageRange, parsePage, parseSort, totalPages } from './pagination';

describe('parsePage', () => {
  it('returns 1 for undefined', () => {
    expect(parsePage(undefined)).toBe(1);
  });

  it('parses positive integer', () => {
    expect(parsePage('5')).toBe(5);
  });

  it('rejects non-numeric', () => {
    expect(parsePage('abc')).toBe(1);
  });

  it('rejects zero and negative', () => {
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-3')).toBe(1);
  });

  it('rejects floats', () => {
    expect(parsePage('1.5')).toBe(1);
  });
});

describe('parseSort', () => {
  it('returns newest by default', () => {
    expect(parseSort(undefined)).toBe('newest');
  });

  it('accepts valid keys', () => {
    expect(parseSort('price_asc')).toBe('price_asc');
    expect(parseSort('price_desc')).toBe('price_desc');
    expect(parseSort('name_asc')).toBe('name_asc');
  });

  it('rejects unknown key', () => {
    expect(parseSort('something_random')).toBe('newest');
  });
});

describe('totalPages', () => {
  it('returns at least 1', () => {
    expect(totalPages(0)).toBe(1);
  });

  it('rounds up', () => {
    expect(totalPages(13, 12)).toBe(2);
    expect(totalPages(24, 12)).toBe(2);
    expect(totalPages(25, 12)).toBe(3);
  });
});

describe('pageRange', () => {
  it('returns all pages when total ≤ 7', () => {
    expect(pageRange(1, 1)).toEqual([1]);
    expect(pageRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('truncates at the start', () => {
    expect(pageRange(1, 10)).toEqual([1, 2, 'ellipsis', 10]);
  });

  it('truncates at the end', () => {
    expect(pageRange(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
  });

  it('truncates both sides for middle pages', () => {
    expect(pageRange(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });
});
