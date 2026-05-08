'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setDefaultAddressAction } from '@/server/actions/addresses';

export function SetDefaultAddressButton({ addressId }: { addressId: string }) {
  const t = useTranslations('addresses');
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      await setDefaultAddressAction({ addressId });
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs uppercase tracking-widest text-bone/60 transition hover:text-gold disabled:opacity-40"
    >
      {pending ? '…' : t('makeDefault')}
    </button>
  );
}
