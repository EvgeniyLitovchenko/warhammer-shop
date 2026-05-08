import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import type { OrderListItem } from '@/server/queries/orders';
import { OrderStatusBadge } from './order-status-badge';

export async function OrderCard({
  order,
  locale,
}: {
  order: OrderListItem;
  locale: Locale;
}) {
  const t = await getTranslations('orders');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="flex flex-col gap-3 rounded-sm border border-bone/10 bg-ash/40 p-6 transition hover:border-gold/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-lg">{order.number}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-xs uppercase tracking-widest text-bone/50">
        {dateFormat.format(order.createdAt)}
      </p>
      <p className="text-sm text-bone/70">
        {t('itemsCount', { n: order.items.length })}
      </p>
      <p className="mt-2 flex items-center justify-between border-t border-bone/10 pt-3 text-sm">
        <span className="text-bone/60">{t('total')}</span>
        <span className="font-display text-lg">{formatUah(order.totalUah, locale)}</span>
      </p>
    </Link>
  );
}
