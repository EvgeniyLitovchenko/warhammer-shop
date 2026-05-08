import { describe, it, expect } from 'vitest';
import { reviewSchema } from './review';

const valid = {
  rating: '5',
  title: 'Чудовий набір',
  body: 'Дуже задоволений покупкою, рекомендую.',
};

describe('reviewSchema', () => {
  it('accepts valid input', () => {
    const r = reviewSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.rating).toBe(5);
  });

  it('rejects rating 0 and 6', () => {
    expect(reviewSchema.safeParse({ ...valid, rating: '0' }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...valid, rating: '6' }).success).toBe(false);
  });

  it('rejects fractional rating', () => {
    expect(reviewSchema.safeParse({ ...valid, rating: '3.5' }).success).toBe(false);
  });

  it('rejects too-short body', () => {
    expect(reviewSchema.safeParse({ ...valid, body: 'short' }).success).toBe(false);
  });

  it('rejects too-long body', () => {
    expect(
      reviewSchema.safeParse({ ...valid, body: 'a'.repeat(2100) }).success,
    ).toBe(false);
  });

  it('treats empty title as null', () => {
    const r = reviewSchema.safeParse({ ...valid, title: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBeNull();
  });

  it('treats missing title as null', () => {
    const { title: _t, ...rest } = valid;
    const r = reviewSchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBeNull();
  });

  it('trims body whitespace', () => {
    const r = reviewSchema.safeParse({ ...valid, body: '   Хороший товар, дякую    ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.body).toBe('Хороший товар, дякую');
  });

  it('rejects too-long title', () => {
    expect(reviewSchema.safeParse({ ...valid, title: 'x'.repeat(150) }).success).toBe(false);
  });
});
