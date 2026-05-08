'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

const items = [
  { key: 'dashboard' as const, href: '/admin', exact: true },
  { key: 'products' as const, href: '/admin/products', exact: false },
  { key: 'orders' as const, href: '/admin/orders', exact: false },
];

export function AdminNav() {
  const t = useTranslations('admin.nav');
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
