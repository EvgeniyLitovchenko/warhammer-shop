import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { isQueryValid } from '@/lib/search';
import type { ProductListItem } from './products';

export async function searchProducts(
  query: string,
  limit = 24,
): Promise<ProductListItem[]> {
  if (!isQueryValid(query)) return [];

  const ids = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id
    FROM "Product"
    WHERE status = 'ACTIVE'
      AND (
        search_vector @@ websearch_to_tsquery('simple', ${query})
        OR similarity(name, ${query}) > 0.2
        OR similarity("nameEn", ${query}) > 0.2
      )
    ORDER BY
      ts_rank_cd(search_vector, websearch_to_tsquery('simple', ${query})) DESC,
      GREATEST(similarity(name, ${query}), similarity("nameEn", ${query})) DESC,
      "createdAt" DESC
    LIMIT ${limit}
  `);

  if (ids.length === 0) return [];

  const idList = ids.map((r) => r.id);

  const products = await prisma.product.findMany({
    where: { id: { in: idList } },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      faction: true,
    },
  });

  const order = new Map(idList.map((id, i) => [id, i] as const));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
