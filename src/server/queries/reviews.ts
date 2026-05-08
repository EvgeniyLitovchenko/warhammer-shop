import type { Prisma, Review } from '@prisma/client';
import { prisma } from '@/lib/db';

const adminReviewInclude = {
  user: { select: { id: true, name: true, email: true } },
  product: { select: { id: true, slug: true, name: true, nameEn: true } },
} satisfies Prisma.ReviewInclude;

export type AdminReviewRow = Prisma.ReviewGetPayload<{ include: typeof adminReviewInclude }>;

const PURCHASED_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

export async function canUserReviewProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  const found = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: PURCHASED_STATUSES as unknown as Prisma.EnumOrderStatusFilter['in'] },
      },
    },
    select: { id: true },
  });
  return Boolean(found);
}

export async function getUserReview(
  userId: string,
  productId: string,
): Promise<Review | null> {
  return prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
}

export async function listAdminReviews(approved?: boolean): Promise<AdminReviewRow[]> {
  return prisma.review.findMany({
    where: approved === undefined ? undefined : { approved },
    orderBy: { createdAt: 'desc' },
    include: adminReviewInclude,
  });
}
