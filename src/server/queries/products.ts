import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { PAGE_SIZE, type SortKey } from '@/lib/pagination';

export type ProductListItem = Prisma.ProductGetPayload<{
  include: {
    images: true;
    faction: true;
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
