import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const adminProductListInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  inventory: true,
  faction: true,
  category: true,
  _count: { select: { orderItems: true } },
} satisfies Prisma.ProductInclude;

const adminProductDetailInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  inventory: true,
} satisfies Prisma.ProductInclude;

export type AdminProductRow = Prisma.ProductGetPayload<{
  include: typeof adminProductListInclude;
}>;

export type AdminProductDetail = Prisma.ProductGetPayload<{
  include: typeof adminProductDetailInclude;
}>;

export async function listAllProductsForAdmin(): Promise<AdminProductRow[]> {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: adminProductListInclude,
  });
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  return prisma.product.findUnique({
    where: { id },
    include: adminProductDetailInclude,
  });
}

export async function listAdminTaxonomy() {
  const [factions, categories] = await Promise.all([
    prisma.faction.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
  ]);
  return { factions, categories };
}
