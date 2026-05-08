import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const orderListInclude = {
  items: true,
} satisfies Prisma.OrderInclude;

const orderDetailInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      },
    },
  },
  address: true,
  history: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.OrderInclude;

export type OrderListItem = Prisma.OrderGetPayload<{ include: typeof orderListInclude }>;
export type OrderDetail = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>;

export async function listUserOrders(userId: string): Promise<OrderListItem[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: orderListInclude,
  });
}

export async function getUserOrder(
  userId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderDetailInclude,
  });
}
