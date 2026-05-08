import { beforeEach, describe, expect, it } from 'vitest';
import { authMock, prismaMock } from '../../../vitest.setup';
import {
  approveReviewAction,
  deleteReviewAction,
  submitReviewAction,
} from './reviews';

const customerSession = {
  user: { id: 'user-1', email: 'c@d.io', role: 'CUSTOMER' as const },
};
const adminSession = { user: { id: 'admin-1', email: 'a@b.io', role: 'ADMIN' as const } };

function reviewForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.append('productId', 'prod-1');
  fd.append('rating', '5');
  fd.append('title', 'Awesome');
  fd.append('body', 'Really enjoyed this product, highly recommend.');
  for (const [k, v] of Object.entries(overrides)) {
    if (v === '') fd.delete(k);
    else fd.set(k, v);
  }
  return fd;
}

beforeEach(() => {
  authMock.mockResolvedValue(customerSession);
  prismaMock.orderItem.findFirst.mockResolvedValue({ id: 'oi-1' } as never);
  prismaMock.product.findUnique.mockResolvedValue({ slug: 'space-marines' } as never);
  prismaMock.review.upsert.mockResolvedValue({ id: 'rev-1' } as never);
  prismaMock.review.update.mockResolvedValue({
    id: 'rev-1',
    product: { slug: 'space-marines' },
  } as never);
  prismaMock.review.findUnique.mockResolvedValue({
    id: 'rev-1',
    rating: 5,
    product: { slug: 'space-marines' },
  } as never);
  prismaMock.review.delete.mockResolvedValue({} as never);
  prismaMock.auditLog.create.mockResolvedValue({} as never);
});

describe('submitReviewAction', () => {
  it('rejects unauthenticated', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await submitReviewAction(undefined, reviewForm());
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('rejects invalid rating', async () => {
    const result = await submitReviewAction(undefined, reviewForm({ rating: '0' }));
    expect(result.error).toBe('invalid_input');
  });

  it('rejects too short body', async () => {
    const result = await submitReviewAction(undefined, reviewForm({ body: 'short' }));
    expect(result.error).toBe('invalid_input');
  });

  it('rejects when user has not purchased the product', async () => {
    prismaMock.orderItem.findFirst.mockResolvedValue(null);
    const result = await submitReviewAction(undefined, reviewForm());
    expect(result).toEqual({ error: 'cannot_review' });
  });

  it('rejects when product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const result = await submitReviewAction(undefined, reviewForm());
    expect(result).toEqual({ error: 'product_not_found' });
  });

  it('upserts an unapproved review on happy path', async () => {
    const result = await submitReviewAction(undefined, reviewForm());
    expect(result).toEqual({ ok: true });
    expect(prismaMock.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ approved: false, rating: 5 }),
        create: expect.objectContaining({ approved: false, rating: 5 }),
      }),
    );
  });

  it('returns unknown on db error', async () => {
    prismaMock.review.upsert.mockRejectedValue(new Error('boom'));
    const result = await submitReviewAction(undefined, reviewForm());
    expect(result).toEqual({ error: 'unknown' });
  });

  it('rejects empty productId', async () => {
    const fd = reviewForm();
    fd.set('productId', '');
    const result = await submitReviewAction(undefined, fd);
    expect(result).toEqual({ error: 'product_not_found' });
  });
});

describe('approveReviewAction', () => {
  it('rejects non-admin', async () => {
    authMock.mockResolvedValueOnce(customerSession);
    const result = await approveReviewAction({ reviewId: 'rev-1' });
    expect(result).toEqual({ ok: false });
  });

  it('publishes a review and writes audit log', async () => {
    authMock.mockResolvedValueOnce(adminSession);
    const result = await approveReviewAction({ reviewId: 'rev-1' });
    expect(result).toEqual({ ok: true });
    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { approved: true } }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'review.approved' }) }),
    );
  });
});

describe('deleteReviewAction', () => {
  it('rejects non-admin', async () => {
    authMock.mockResolvedValueOnce(customerSession);
    const result = await deleteReviewAction({ reviewId: 'rev-1' });
    expect(result.ok).toBe(false);
  });

  it('rejects when review does not exist', async () => {
    authMock.mockResolvedValueOnce(adminSession);
    prismaMock.review.findUnique.mockResolvedValue(null);
    const result = await deleteReviewAction({ reviewId: 'rev-1' });
    expect(result.ok).toBe(false);
  });

  it('deletes review and writes audit log', async () => {
    authMock.mockResolvedValueOnce(adminSession);
    const result = await deleteReviewAction({ reviewId: 'rev-1' });
    expect(result).toEqual({ ok: true });
    expect(prismaMock.review.delete).toHaveBeenCalled();
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'review.deleted' }) }),
    );
  });
});
