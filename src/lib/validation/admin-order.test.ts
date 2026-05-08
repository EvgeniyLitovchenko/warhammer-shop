import { describe, it, expect } from 'vitest';
import { ORDER_STATUSES, orderStatusUpdateSchema } from './admin-order';

describe('orderStatusUpdateSchema', () => {
  it('accepts valid input', () => {
    const r = orderStatusUpdateSchema.safeParse({
      orderId: 'ord_1',
      status: 'PAID',
      comment: 'Charged via Stripe',
    });
    expect(r.success).toBe(true);
  });

  it('accepts every defined status', () => {
    for (const status of ORDER_STATUSES) {
      const r = orderStatusUpdateSchema.safeParse({ orderId: 'ord_1', status });
      expect(r.success).toBe(true);
    }
  });

  it('treats empty comment as null', () => {
    const r = orderStatusUpdateSchema.safeParse({
      orderId: 'ord_1',
      status: 'PAID',
      comment: '',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.comment).toBeNull();
  });

  it('treats missing comment as null', () => {
    const r = orderStatusUpdateSchema.safeParse({ orderId: 'ord_1', status: 'PAID' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.comment).toBeNull();
  });

  it('rejects empty orderId', () => {
    expect(
      orderStatusUpdateSchema.safeParse({ orderId: '', status: 'PAID' }).success,
    ).toBe(false);
  });

  it('rejects unknown status', () => {
    expect(
      orderStatusUpdateSchema.safeParse({ orderId: 'ord_1', status: 'NUKED' as never })
        .success,
    ).toBe(false);
  });

  it('rejects too-long comment', () => {
    expect(
      orderStatusUpdateSchema.safeParse({
        orderId: 'ord_1',
        status: 'PAID',
        comment: 'x'.repeat(600),
      }).success,
    ).toBe(false);
  });
});
