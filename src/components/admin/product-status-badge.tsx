import type { ProductStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

const CLASSES: Record<ProductStatus, string> = {
  DRAFT: 'border-bone/30 text-bone/70',
  ACTIVE: 'border-emerald-400/60 text-emerald-400',
  ARCHIVED: 'border-red-400/60 text-red-400',
};

export async function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const t = await getTranslations('admin.products.status');
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${CLASSES[status]}`}
    >
      {t(status)}
    </span>
  );
}
