'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';

const FILTERS = ['pending', 'approved', 'all'] as const;
type Filter = (typeof FILTERS)[number];

export function ReviewStatusFilter({ value }: { value: Filter }) {
  const t = useTranslations('admin.reviews.filter');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (next: Filter) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next === 'pending') params.delete('filter');
    else params.set('filter', next);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => apply(f)}
          disabled={pending}
          className={
            value === f
              ? 'rounded-sm border border-gold/60 bg-gold/10 px-3 py-1.5 text-xs uppercase tracking-widest text-gold'
              : 'rounded-sm border border-bone/20 px-3 py-1.5 text-xs uppercase tracking-widest text-bone/70 transition hover:border-bone/40 hover:text-bone'
          }
        >
          {t(f)}
        </button>
      ))}
    </div>
  );
}
