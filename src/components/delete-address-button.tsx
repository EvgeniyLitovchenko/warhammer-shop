'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { deleteAddressAction } from '@/server/actions/addresses';

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const t = useTranslations('addresses');
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      await deleteAddressAction({ addressId });
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs uppercase tracking-widest text-bone/50 transition hover:text-red-400 disabled:opacity-40"
    >
      {pending ? t('deleting') : t('delete')}
    </button>
  );
}
