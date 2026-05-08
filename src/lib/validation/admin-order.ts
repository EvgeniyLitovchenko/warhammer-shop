import { z } from 'zod';

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  comment: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.string().trim().max(500).nullable(),
  ),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
