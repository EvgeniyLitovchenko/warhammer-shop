import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^\+?[\d\s()\-]+$/u, 'phone_format'),
  country: z.string().trim().length(2).toUpperCase().default('UA'),
  region: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(20),
  street: z.string().trim().min(1).max(200),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
