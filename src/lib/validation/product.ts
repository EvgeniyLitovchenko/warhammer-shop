import { z } from 'zod';

const slugRegex = /^[a-z0-9-]+$/;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable();

const imageUrl = z.string().trim().url();

export const productSchema = z
  .object({
    slug: z.string().trim().toLowerCase().min(2).max(80).regex(slugRegex, 'slug_format'),
    sku: z.string().trim().min(2).max(40),
    name: z.string().trim().min(2).max(200),
    nameEn: z.string().trim().min(2).max(200),
    description: z.string().trim().min(10).max(5000),
    descriptionEn: z.string().trim().min(10).max(5000),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
    priceUah: z.coerce.number().min(1).max(1_000_000),
    comparePriceUah: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : v),
      z.coerce.number().min(0).max(1_000_000).nullable(),
    ),
    categoryId: z.string().trim().min(1),
    factionId: optionalString(40),
    stock: z.coerce.number().int().min(0).max(99_999),
    imagesText: z
      .string()
      .transform((v) =>
        v
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
      )
      .pipe(z.array(imageUrl).max(10)),
  })
  .transform((data) => ({
    ...data,
    priceUah: Math.round(data.priceUah * 100),
    comparePriceUah:
      data.comparePriceUah !== null ? Math.round(data.comparePriceUah * 100) : null,
  }));

export type ProductInput = z.infer<typeof productSchema>;
