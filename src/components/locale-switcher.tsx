'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: 'uk' | 'en') => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="flex items-center gap-1 text-xs uppercase tracking-wider">
      {(['uk', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          disabled={pending}
          className={
            code === locale
              ? 'text-gold'
              : 'text-bone/60 transition hover:text-bone'
          }
        >
          {code}
        </button>
      ))}
    </div>
  );
}
