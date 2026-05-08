import type { OrderStatus, Prisma } from '@prisma/client';
import { daysAgo } from '@/lib/dashboard-stats';
import { prisma } from '@/lib/db';

const COUNTABLE_STATUSES: OrderStatus[] = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const LOW_STOCK_THRESHOLD = 5;
const PERIOD_DAYS = 7;

const recentOrderInclude = {
  user: { select: { name: true, email: true } },
  items: { select: { id: true } },
} satisfies Prisma.OrderInclude;

const lowStockInclude = {
  inventory: true,
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} satisfies Prisma.ProductInclude;

const topProductInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} satisfies Prisma.ProductInclude;

export type RecentOrderRow = Prisma.OrderGetPayload<{ include: typeof recentOrderInclude }>;
export type LowStockRow = Prisma.ProductGetPayload<{ include: typeof lowStockInclude }>;
export type TopProductRow = {
  product: Prisma.ProductGetPayload<{ include: typeof topProductInclude }>;
  units: number;
};

export type DashboardSnapshot = {
  periodDays: number;
  current: { revenue: number; orders: number; avgOrder: number; newCustomers: number };
  previous: { revenue: number; orders: number; newCustomers: number };
  pendingOrders: number;
  topProducts: TopProductRow[];
  recentOrders: RecentOrderRow[];
  lowStock: LowStockRow[];
};

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const now = new Date();
  const periodStart = daysAgo(PERIOD_DAYS, now);
  const previousStart = daysAgo(PERIOD_DAYS * 2, now);

  const [
    currentSales,
    previousSales,
    newCustomers,
    previousNewCustomers,
    pendingOrders,
    topProductsAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalUah: true },
      _count: true,
      _avg: { totalUah: true },
      where: { status: { in: COUNTABLE_STATUSES }, createdAt: { gte: periodStart } },
    }),
    prisma.order.aggregate({
      _sum: { totalUah: true },
      _count: true,
      where: {
        status: { in: COUNTABLE_STATUSES },
        createdAt: { gte: previousStart, lt: periodStart },
      },
    }),
    prisma.user.count({
      where: { role: 'CUSTOMER', createdAt: { gte: periodStart } },
    }),
    prisma.user.count({
      where: { role: 'CUSTOMER', createdAt: { gte: previousStart, lt: periodStart } },
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { status: { in: COUNTABLE_STATUSES } } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: recentOrderInclude,
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        inventory: { stock: { lte: LOW_STOCK_THRESHOLD } },
      },
      include: lowStockInclude,
      orderBy: [{ inventory: { stock: 'asc' } }],
      take: 5,
    }),
  ]);

  const topProductIds = topProductsAgg.map((t) => t.productId);
  const topProducts: TopProductRow[] = [];

  if (topProductIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: topProductInclude,
    });
    const map = new Map(products.map((p) => [p.id, p]));
    for (const agg of topProductsAgg) {
      const product = map.get(agg.productId);
      if (!product) continue;
      topProducts.push({ product, units: agg._sum.quantity ?? 0 });
    }
  }

  return {
    periodDays: PERIOD_DAYS,
    current: {
      revenue: currentSales._sum.totalUah ?? 0,
      orders: currentSales._count,
      avgOrder: Math.round(currentSales._avg.totalUah ?? 0),
      newCustomers,
    },
    previous: {
      revenue: previousSales._sum.totalUah ?? 0,
      orders: previousSales._count,
      newCustomers: previousNewCustomers,
    },
    pendingOrders,
    topProducts,
    recentOrders,
    lowStock,
  };
}
