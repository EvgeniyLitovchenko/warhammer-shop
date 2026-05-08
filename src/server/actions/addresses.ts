'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { addressSchema, type AddressInput } from '@/lib/validation/address';

export type AddressFormState = {
  error?: 'unauthorized' | 'invalid_input' | 'not_found' | 'unknown';
  fieldErrors?: Partial<Record<keyof AddressInput, string[]>>;
  values?: Partial<Record<keyof AddressInput, string>>;
};

function readForm(formData: FormData) {
  return {
    fullName: String(formData.get('fullName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    country: String(formData.get('country') ?? 'UA'),
    region: String(formData.get('region') ?? ''),
    city: String(formData.get('city') ?? ''),
    postalCode: String(formData.get('postalCode') ?? ''),
    street: String(formData.get('street') ?? ''),
    isDefault: formData.get('isDefault') === 'on',
  };
}

export async function saveAddressAction(
  _prev: AddressFormState | undefined,
  formData: FormData,
): Promise<AddressFormState> {
  const session = await auth();
  if (!session?.user) return { error: 'unauthorized' };

  const id = (formData.get('id') as string | null) || null;
  const raw = readForm(formData);
  const parsed = addressSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: 'invalid_input',
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        fullName: raw.fullName,
        phone: raw.phone,
        country: raw.country,
        region: raw.region,
        city: raw.city,
        postalCode: raw.postalCode,
        street: raw.street,
      },
    };
  }

  const data = parsed.data;
  let savedId = id;

  try {
    if (id) {
      const existing = await prisma.address.findFirst({
        where: { id, userId: session.user.id },
      });
      if (!existing) return { error: 'not_found' };

      await prisma.address.update({ where: { id }, data });
      savedId = id;
    } else {
      const created = await prisma.address.create({
        data: { ...data, userId: session.user.id },
      });
      savedId = created.id;
    }

    if (data.isDefault && savedId) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, NOT: { id: savedId } },
        data: { isDefault: false },
      });
    }
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/account/addresses');
  redirect('/account/addresses');
}

export async function deleteAddressAction({
  addressId,
}: {
  addressId: string;
}): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) return { ok: false };

  const result = await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });

  revalidatePath('/account/addresses');
  return { ok: result.count > 0 };
}

export async function setDefaultAddressAction({
  addressId,
}: {
  addressId: string;
}): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) return { ok: false };

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });
  if (!address) return { ok: false };

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id, NOT: { id: addressId } },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath('/account/addresses');
  return { ok: true };
}
