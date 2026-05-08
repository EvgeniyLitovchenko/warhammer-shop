'use client';

import type { ProductStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setProductStatusAction } from '@/server/actions/admin-products';

export function ProductStatusButton({
  productId,
  current,
  next,
}: {
  productId: string;
  current: ProductStatus;
  next: ProductStatus;
}) {
  const t = useTranslations('admin.products');
  const [pending, startTransition] = useTransition();

  if (current === next) return null;

  const onClick = () => {
    startTransition(async () => {
      await setProductStatusAction({ productId, status: next });
    });
  };

  const label = next === 'ACTIVE' ? t('activate') : next === 'ARCHIVED' ? t('archive') : t('draft');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs uppercase tracking-widest text-bone/60 transition hover:text-gold disabled:opacity-40"
    >
      {pending ? '…' : label}
    </button>
  );
}
