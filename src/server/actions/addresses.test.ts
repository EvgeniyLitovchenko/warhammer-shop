import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { authMock, prismaMock } from '../../../vitest.setup';
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from './addresses';

const session = { user: { id: 'user-1', email: 'a@b.io', role: 'CUSTOMER' as const } };

const validForm = () => {
  const fd = new FormData();
  fd.append('fullName', 'John Doe');
  fd.append('phone', '+380501234567');
  fd.append('country', 'UA');
  fd.append('region', 'Kyiv oblast');
  fd.append('city', 'Kyiv');
  fd.append('postalCode', '01001');
  fd.append('street', 'Khreshchatyk 1');
  return fd;
};

beforeEach(() => {
  authMock.mockResolvedValue(session);
  prismaMock.address.create.mockResolvedValue({ id: 'addr-new' } as never);
  prismaMock.address.update.mockResolvedValue({ id: 'addr-1' } as never);
  prismaMock.address.updateMany.mockResolvedValue({ count: 0 });
  prismaMock.address.findFirst.mockResolvedValue(null);
});

describe('saveAddressAction', () => {
  it('rejects unauthenticated user', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await saveAddressAction(undefined, validForm());
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('rejects invalid input with field errors', async () => {
    const fd = validForm();
    fd.set('phone', 'NOT-A-PHONE!');
    const result = await saveAddressAction(undefined, fd);
    expect(result.error).toBe('invalid_input');
    expect(result.fieldErrors?.phone).toBeDefined();
  });

  it('creates a new address when no id provided', async () => {
    try {
      await saveAddressAction(undefined, validForm());
    } catch (e) {
      expect((e as Error).message).toContain('NEXT_REDIRECT');
    }
    expect(prismaMock.address.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1', fullName: 'John Doe' }),
      }),
    );
  });

  it('updates existing address when id is provided', async () => {
    const fd = validForm();
    fd.append('id', 'addr-1');
    prismaMock.address.findFirst.mockResolvedValue({ id: 'addr-1' } as never);

    try {
      await saveAddressAction(undefined, fd);
    } catch {
      /* redirect */
    }
    expect(prismaMock.address.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'addr-1' } }),
    );
  });

  it('returns not_found when editing someone else address', async () => {
    const fd = validForm();
    fd.append('id', 'addr-1');
    prismaMock.address.findFirst.mockResolvedValue(null);

    const result = await saveAddressAction(undefined, fd);
    expect(result).toEqual({ error: 'not_found' });
    expect(prismaMock.address.update).not.toHaveBeenCalled();
  });

  it('unsets default on others when isDefault=on', async () => {
    const fd = validForm();
    fd.append('isDefault', 'on');

    try {
      await saveAddressAction(undefined, fd);
    } catch {
      /* redirect */
    }
    expect(prismaMock.address.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isDefault: false } }),
    );
  });

  it('returns unknown on db failure', async () => {
    prismaMock.address.create.mockRejectedValue(new Error('boom'));
    const result = await saveAddressAction(undefined, validForm());
    expect(result).toEqual({ error: 'unknown' });
  });
});

describe('deleteAddressAction', () => {
  it('returns ok=false when not authenticated', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await deleteAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(false);
  });

  it('returns ok=true when address deleted', async () => {
    prismaMock.address.deleteMany.mockResolvedValue({ count: 1 });
    const result = await deleteAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(true);
    expect(prismaMock.address.deleteMany).toHaveBeenCalledWith({
      where: { id: 'addr-1', userId: 'user-1' },
    });
  });

  it('returns ok=false when address belongs to another user', async () => {
    prismaMock.address.deleteMany.mockResolvedValue({ count: 0 });
    const result = await deleteAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(false);
  });
});

describe('setDefaultAddressAction', () => {
  it('returns ok=false when not authenticated', async () => {
    authMock.mockResolvedValueOnce(null);
    const result = await setDefaultAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(false);
  });

  it('returns ok=false when address does not exist', async () => {
    prismaMock.address.findFirst.mockResolvedValue(null);
    const result = await setDefaultAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(false);
  });

  it('clears default on others and sets it on the target', async () => {
    prismaMock.address.findFirst.mockResolvedValue({ id: 'addr-1' } as never);
    prismaMock.$transaction.mockResolvedValue([{}, {}] as never);

    const result = await setDefaultAddressAction({ addressId: 'addr-1' });
    expect(result.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe('saveAddressAction unique constraint handling', () => {
  it('passes through unique violation as unknown', async () => {
    prismaMock.address.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );
    const result = await saveAddressAction(undefined, validForm());
    expect(result).toEqual({ error: 'unknown' });
  });
});
