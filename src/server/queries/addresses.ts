import type { Address } from '@prisma/client';
import { prisma } from '@/lib/db';

export async function listUserAddresses(userId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
}

export async function getUserAddress(
  userId: string,
  addressId: string,
): Promise<Address | null> {
  return prisma.address.findFirst({
    where: { id: addressId, userId },
  });
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  return prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
}
