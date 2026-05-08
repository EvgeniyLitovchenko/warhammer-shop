'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

const items = [
  { key: 'profile' as const, href: '/account', exact: true },
  { key: 'addresses' as const, href: '/account/addresses', exact: false },
  { key: 'orders' as const, href: '/account/orders', exact: false },
];

export function AccountNav() {
  const t = useTranslations('account.nav');
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = isActive(it.href, it.exact);
        return (
          <Link
            key={it.key}
            href={it.href}
            className={
              active
                ? 'rounded-sm border-l-2 border-gold bg-ash/40 px-4 py-2 text-bone'
                : 'rounded-sm border-l-2 border-transparent px-4 py-2 text-bone/60 transition hover:border-bone/30 hover:text-bone'
            }
          >
            {t(it.key)}
          </Link>
        );
      })}
    </nav>
  );
}
