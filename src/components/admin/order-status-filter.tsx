'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { ORDER_STATUSES } from '@/lib/validation/admin-order';

export function OrderStatusFilter({ value }: { value: string | null }) {
  const t = useTranslations('admin.orders');
  const tStatus = useTranslations('orders.status');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (next: string | null) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next === null) params.delete('status');
    else params.set('status', next);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const Pill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={
        active
          ? 'rounded-sm border border-gold/60 bg-gold/10 px-3 py-1.5 text-xs uppercase tracking-widest text-gold'
          : 'rounded-sm border border-bone/20 px-3 py-1.5 text-xs uppercase tracking-widest text-bone/70 transition hover:border-bone/40 hover:text-bone'
      }
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Pill active={value === null} label={t('all')} onClick={() => apply(null)} />
      {ORDER_STATUSES.map((status) => (
        <Pill
          key={status}
          active={value === status}
          label={tStatus(status)}
          onClick={() => apply(status)}
        />
      ))}
    </div>
  );
}
