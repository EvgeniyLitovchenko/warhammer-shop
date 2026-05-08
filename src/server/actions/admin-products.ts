'use server';

import { Prisma, type ProductStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { productSchema, type ProductInput } from '@/lib/validation/product';

type FieldErrors = Partial<Record<keyof ProductInput | 'imagesText', string[]>>;

export type ProductFormState = {
  error?: 'unauthorized' | 'invalid_input' | 'slug_taken' | 'sku_taken' | 'unknown';
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
};

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') return null;
  return session.user;
}

function readForm(formData: FormData): Record<string, FormDataEntryValue | null> {
  const fields = [
    'slug',
    'sku',
    'name',
    'nameEn',
    'description',
    'descriptionEn',
    'status',
    'priceUah',
    'comparePriceUah',
    'categoryId',
    'factionId',
    'stock',
    'imagesText',
  ];
  const out: Record<string, FormDataEntryValue | null> = {};
  for (const f of fields) out[f] = formData.get(f) ?? '';
  return out;
}

export async function saveProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  const user = await requireStaff();
  if (!user) return { error: 'unauthorized' };

  const id = (formData.get('id') as string | null) || null;
  const raw = readForm(formData);
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      error: 'invalid_input',
      fieldErrors: flat as FieldErrors,
      values: Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? v : '']),
      ),
    };
  }

  const data = parsed.data;
  const { imagesText: imageUrls, stock, ...productFields } = data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const saved = id
        ? await tx.product.update({ where: { id }, data: productFields })
        : await tx.product.create({ data: productFields });

      await tx.productImage.deleteMany({ where: { productId: saved.id } });
      if (imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: imageUrls.map((url, i) => ({
            productId: saved.id,
            url,
            alt: saved.name,
            sortOrder: i,
          })),
        });
      }

      await tx.inventory.upsert({
        where: { productId: saved.id },
        update: { stock },
        create: { productId: saved.id, stock },
      });

      return saved;
    });

    revalidatePath('/admin/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/catalog');
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = Array.isArray(e.meta?.target) ? (e.meta.target as string[]) : [];
      if (target.includes('slug')) return { error: 'slug_taken' };
      if (target.includes('sku')) return { error: 'sku_taken' };
    }
    return { error: 'unknown' };
  }

  redirect('/admin/products');
}

export async function setProductStatusAction({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}): Promise<{ ok: boolean }> {
  const user = await requireStaff();
  if (!user) return { ok: false };

  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath('/admin/products');
  revalidatePath('/catalog');
  return { ok: true };
}
