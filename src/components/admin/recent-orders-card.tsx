import { getTranslations } from 'next-intl/server';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import type { RecentOrderRow } from '@/server/queries/dashboard';

export async function RecentOrdersCard({
  orders,
  locale,
}: {
  orders: RecentOrderRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.dashboard');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="rounded-sm border border-bone/10 bg-ash/40 p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-bone/60">
          {t('recentOrders')}
        </h2>
        <Link
          href="/admin/orders"
          className="text-xs uppercase tracking-widest text-bone/60 hover:text-gold"
        >
          {t('seeAll')} →
        </Link>
      </header>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-bone/50">{t('noOrders')}</p>
      ) : (
        <ul className="mt-4 flex flex-col">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3 border-b border-bone/10 py-3 last:border-0">
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex flex-col flex-1 hover:text-gold"
              >
                <span className="font-display text-sm">{order.number}</span>
                <span className="text-xs text-bone/50">
                  {order.user.name ?? order.user.email} · {dateFormat.format(order.createdAt)}
                </span>
              </Link>
              <span className="font-display text-sm">{formatUah(order.totalUah, locale)}</span>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
