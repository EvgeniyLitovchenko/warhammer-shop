'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { SORT_KEYS, type SortKey } from '@/lib/pagination';

export function SortSelect({ value }: { value: SortKey }) {
  const t = useTranslations('catalog.sort');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const onChange = (next: SortKey) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('sort', next);
    params.delete('page');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="uppercase tracking-wider text-bone/60">{t('label')}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        disabled={pending}
        className="rounded-sm border border-bone/20 bg-ash/60 px-3 py-2 text-sm outline-none transition focus:border-gold/60"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {t(key)}
          </option>
        ))}
      </select>
    </label>
  );
}
