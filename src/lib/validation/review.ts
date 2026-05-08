import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.string().trim().max(120).nullable(),
  ),
  body: z.string().trim().min(10).max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
