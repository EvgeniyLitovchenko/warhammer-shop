'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { reviewSchema, type ReviewInput } from '@/lib/validation/review';
import { canUserReviewProduct } from '@/server/queries/reviews';

export type ReviewFormState = {
  ok?: true;
  error?:
    | 'unauthorized'
    | 'invalid_input'
    | 'cannot_review'
    | 'product_not_found'
    | 'unknown';
  fieldErrors?: Partial<Record<keyof ReviewInput, string[]>>;
};

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') return null;
  return session.user;
}

export async function submitReviewAction(
  _prev: ReviewFormState | undefined,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user) return { error: 'unauthorized' };

  const productId = String(formData.get('productId') ?? '');
  if (!productId) return { error: 'product_not_found' };

  const parsed = reviewSchema.safeParse({
    rating: formData.get('rating'),
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return {
      error: 'invalid_input',
      fieldErrors: parsed.error.flatten().fieldErrors as ReviewFormState['fieldErrors'],
    };
  }

  const allowed = await canUserReviewProduct(session.user.id, productId);
  if (!allowed) return { error: 'cannot_review' };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) return { error: 'product_not_found' };

  try {
    await prisma.review.upsert({
      where: { productId_userId: { productId, userId: session.user.id } },
      update: {
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        approved: false,
      },
      create: {
        productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        approved: false,
      },
    });
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath(`/products/${product.slug}`);
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function approveReviewAction({
  reviewId,
}: {
  reviewId: string;
}): Promise<{ ok: boolean }> {
  const user = await requireStaff();
  if (!user) return { ok: false };

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { approved: true },
    include: { product: { select: { slug: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'review.approved',
      entity: 'Review',
      entityId: reviewId,
      payload: { productSlug: updated.product.slug },
    },
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/products/${updated.product.slug}`);
  return { ok: true };
}

export async function deleteReviewAction({
  reviewId,
}: {
  reviewId: string;
}): Promise<{ ok: boolean }> {
  const user = await requireStaff();
  if (!user) return { ok: false };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: { select: { slug: true } } },
  });
  if (!review) return { ok: false };

  await prisma.review.delete({ where: { id: reviewId } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'review.deleted',
      entity: 'Review',
      entityId: reviewId,
      payload: {
        productSlug: review.product.slug,
        rating: review.rating,
      },
    },
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/products/${review.product.slug}`);
  return { ok: true };
}
