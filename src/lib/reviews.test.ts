import { describe, it, expect } from 'vitest';
import { averageRating, clampStars } from './reviews';

describe('averageRating', () => {
  it('returns 0 for empty', () => {
    expect(averageRating([])).toBe(0);
  });

  it('returns the only value', () => {
    expect(averageRating([4])).toBe(4);
  });

  it('averages multiple ratings', () => {
    expect(averageRating([5, 4, 3])).toBe(4);
  });

  it('preserves fractional precision', () => {
    expect(averageRating([5, 4])).toBe(4.5);
  });
});

describe('clampStars', () => {
  it('clamps below zero', () => {
    expect(clampStars(-1)).toBe(0);
  });

  it('clamps above five', () => {
    expect(clampStars(7)).toBe(5);
  });

  it('rounds halves up', () => {
    expect(clampStars(3.5)).toBe(4);
  });

  it('rounds halves down', () => {
    expect(clampStars(3.4)).toBe(3);
  });
});
