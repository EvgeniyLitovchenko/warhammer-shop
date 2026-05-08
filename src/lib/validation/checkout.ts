import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1),
  shippingMethod: z.enum(['NOVA_POSHTA', 'PICKUP']),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'CARD_ON_DELIVERY', 'STRIPE']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
