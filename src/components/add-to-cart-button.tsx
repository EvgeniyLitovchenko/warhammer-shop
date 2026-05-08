'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { addToCartAction } from '@/server/actions/cart';

type Status = 'idle' | 'success' | 'error';

export function AddToCartButton({
  productId,
  disabled = false,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const t = useTranslations('product');
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const onClick = () => {
    setStatus('idle');
    setErrorKey(null);
    startTransition(async () => {
      const result = await addToCartAction({ productId, quantity: 1 });
      if (result.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        setStatus('error');
        setErrorKey(result.error);
      }
    });
  };

  const label =
    status === 'success'
      ? t('addedToCart')
      : pending
        ? t('adding')
        : t('addToCart');

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={onClick}
        className="self-start rounded-sm bg-blood px-8 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-40"
      >
        {label}
      </button>
      {status === 'error' && errorKey && (
        <p className="text-sm text-red-400">{t(`cartErrors.${errorKey}`)}</p>
      )}
    </div>
  );
}
