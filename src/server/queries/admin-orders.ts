import type { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const adminOrderListInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderInclude;

const adminOrderDetailInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: 'asc' as const }, take: 1 } },
      },
    },
  },
  address: true,
  history: { orderBy: { createdAt: 'desc' as const } },
  user: { select: { id: true, name: true, email: true, role: true } },
  payments: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.OrderInclude;

export type AdminOrderRow = Prisma.OrderGetPayload<{ include: typeof adminOrderListInclude }>;
export type AdminOrderDetail = Prisma.OrderGetPayload<{ include: typeof adminOrderDetailInclude }>;

export type AuditEntry = {
  id: string;
  action: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
  actor: { id: string; name: string | null; email: string } | null;
};

export async function listAllOrders(status: OrderStatus | null = null): Promise<AdminOrderRow[]> {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: adminOrderListInclude,
  });
}

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderDetailInclude,
  });
}

export async function getOrderAudit(orderId: string): Promise<AuditEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: { entity: 'Order', entityId: orderId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const actorIds = Array.from(
    new Set(logs.map((l) => l.actorId).filter((id): id is string => Boolean(id))),
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const actorMap = new Map(actors.map((u) => [u.id, u]));

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    payload: log.payload,
    createdAt: log.createdAt,
    actor: log.actorId ? (actorMap.get(log.actorId) ?? null) : null,
  }));
}
