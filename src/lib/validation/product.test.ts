import { describe, it, expect } from 'vitest';
import { productSchema } from './product';

const valid = {
  slug: 'space-marines-test',
  sku: 'TEST-001',
  name: 'Тестовий загін',
  nameEn: 'Test squad',
  description: 'Опис тестового товару, достатньої довжини.',
  descriptionEn: 'Description of the test product, with enough length.',
  status: 'DRAFT' as const,
  priceUah: '1500',
  comparePriceUah: '1800',
  categoryId: 'cat_xxx',
  factionId: 'fac_xxx',
  stock: '12',
  imagesText: 'https://example.com/a.jpg\nhttps://example.com/b.jpg',
};

describe('productSchema', () => {
  it('accepts valid input and converts price to kopecks', () => {
    const r = productSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.priceUah).toBe(150000);
      expect(r.data.comparePriceUah).toBe(180000);
    }
  });

  it('handles empty comparePriceUah as null', () => {
    const r = productSchema.safeParse({ ...valid, comparePriceUah: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.comparePriceUah).toBeNull();
  });

  it('handles empty factionId as null', () => {
    const r = productSchema.safeParse({ ...valid, factionId: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.factionId).toBeNull();
  });

  it('lowercases the slug', () => {
    const r = productSchema.safeParse({ ...valid, slug: 'Space-MARINES-test' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.slug).toBe('space-marines-test');
  });

  it('rejects slug with spaces or special chars', () => {
    expect(productSchema.safeParse({ ...valid, slug: 'has space' }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, slug: 'has_underscore' }).success).toBe(false);
  });

  it('parses image URLs from a textarea', () => {
    const r = productSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.imagesText).toEqual([
        'https://example.com/a.jpg',
        'https://example.com/b.jpg',
      ]);
    }
  });

  it('drops empty lines from image text', () => {
    const r = productSchema.safeParse({
      ...valid,
      imagesText: '\n\nhttps://example.com/a.jpg\n   \nhttps://example.com/b.jpg\n',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.imagesText).toHaveLength(2);
  });

  it('rejects non-URL image lines', () => {
    expect(
      productSchema.safeParse({ ...valid, imagesText: 'not-a-url\nhttp://ok.example/x.jpg' })
        .success,
    ).toBe(false);
  });

  it('rejects negative stock', () => {
    expect(productSchema.safeParse({ ...valid, stock: '-5' }).success).toBe(false);
  });

  it('rejects too-short description', () => {
    expect(productSchema.safeParse({ ...valid, description: 'a' }).success).toBe(false);
  });

  it('caps imagesText at 10 entries', () => {
    const lots = Array.from({ length: 12 }, (_, i) => `https://example.com/${i}.jpg`).join('\n');
    expect(productSchema.safeParse({ ...valid, imagesText: lots }).success).toBe(false);
  });
});
