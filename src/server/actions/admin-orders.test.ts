import { beforeEach, describe, expect, it } from 'vitest';
import { authMock, prismaMock } from '../../../vitest.setup';
import { changeOrderStatusAction } from './admin-orders';

const adminSession = { user: { id: 'admin-1', email: 'a@b.io', role: 'ADMIN' as const } };
const customerSession = {
  user: { id: 'customer-1', email: 'c@d.io', role: 'CUSTOMER' as const },
};

function form(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.append('orderId', 'order-1');
  fd.append('status', 'PROCESSING');
  for (const [key, val] of Object.entries(overrides)) {
    if (val === '') fd.delete(key);
    else fd.set(key, val);
  }
  return fd;
}

beforeEach(() => {
  authMock.mockResolvedValue(adminSession);
  prismaMock.order.findUnique.mockResolvedValue({
    id: 'order-1',
    status: 'PENDING',
  } as never);
  prismaMock.order.update.mockResolvedValue({} as never);
  prismaMock.orderStatusHistory.create.mockResolvedValue({} as never);
  prismaMock.auditLog.create.mockResolvedValue({} as never);
  prismaMock.$transaction.mockResolvedValue([{}, {}, {}] as never);
});

describe('changeOrderStatusAction', () => {
  it('rejects when not authenticated', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('rejects CUSTOMER role', async () => {
    authMock.mockResolvedValueOnce(customerSession);
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('allows MANAGER role', async () => {
    authMock.mockResolvedValueOnce({
      user: { id: 'mgr-1', email: 'm@b.io', role: 'MANAGER' as const },
    });
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ ok: true });
  });

  it('rejects invalid status value', async () => {
    const result = await changeOrderStatusAction(undefined, form({ status: 'NUKED' }));
    expect(result).toEqual({ error: 'invalid_input' });
  });

  it('rejects empty orderId', async () => {
    const result = await changeOrderStatusAction(undefined, form({ orderId: '' }));
    expect(result).toEqual({ error: 'invalid_input' });
  });

  it('returns not_found when order does not exist', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ error: 'not_found' });
  });

  it('is a no-op when status unchanged and no comment', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'PROCESSING',
    } as never);
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('writes status history and audit log on change', async () => {
    const result = await changeOrderStatusAction(
      undefined,
      form({ comment: 'Shipped via Nova Poshta' }),
    );
    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('returns unknown on transaction failure', async () => {
    prismaMock.$transaction.mockRejectedValue(new Error('boom'));
    const result = await changeOrderStatusAction(undefined, form());
    expect(result).toEqual({ error: 'unknown' });
  });
});
