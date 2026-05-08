import type { OrderStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: 'border-bone/40 text-bone/80',
  PAID: 'border-amber-400/60 text-amber-400',
  PROCESSING: 'border-blue-400/60 text-blue-400',
  SHIPPED: 'border-cyan-400/60 text-cyan-400',
  DELIVERED: 'border-emerald-400/60 text-emerald-400',
  CANCELLED: 'border-red-400/60 text-red-400',
  REFUNDED: 'border-purple-400/60 text-purple-400',
};

export async function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = await getTranslations('orders.status');
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_CLASSES[status]}`}
    >
      {t(status)}
    </span>
  );
}
