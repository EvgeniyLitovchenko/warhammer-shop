import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { PAGE_SIZE, type SortKey } from '@/lib/pagination';

export type ProductListItem = Prisma.ProductGetPayload<{
  include: {
    images: true;
    faction: true;
  };
}>;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: {
    images: true;
    faction: true;
    category: true;
    inventory: true;
    reviews: { include: { user: true } };
  };
}>;

const orderByFor = (sort: SortKey): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case 'price_asc':
      return { priceUah: 'asc' };
    case 'price_desc':
      return { priceUah: 'desc' };
    case 'name_asc':
      return { name: 'asc' };
    case 'newest':
      return { createdAt: 'desc' };
  }
};

export async function listProducts({
  page,
  sort,
}: {
  page: number;
  sort: SortKey;
}): Promise<{ items: ProductListItem[]; total: number; pageSize: number }> {
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        faction: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, pageSize: PAGE_SIZE };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      faction: true,
      category: true,
      inventory: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      },
    },
  });
}

export async function listRelatedProducts({
  productId,
  factionId,
  categoryId,
  limit = 4,
}: {
  productId: string;
  factionId: string | null;
  categoryId: string;
  limit?: number;
}): Promise<ProductListItem[]> {
  const orClauses: Prisma.ProductWhereInput[] = [{ categoryId }];
  if (factionId) orClauses.push({ factionId });

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    id: { not: productId },
    OR: orClauses,
  };

  return prisma.product.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      faction: true,
    },
  });
}
