'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { isQueryValid, normalizeQuery } from '@/lib/search';

export function SearchBar({ className = '' }: { className?: string }) {
  const t = useTranslations('search');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = normalizeQuery(value);
    if (!isQueryValid(q)) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={onSubmit} role="search" className={className}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        className="w-full rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none transition placeholder:text-bone/40 focus:border-gold/60"
      />
    </form>
  );
}
