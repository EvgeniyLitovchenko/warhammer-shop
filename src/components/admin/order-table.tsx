import { getTranslations } from 'next-intl/server';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import type { AdminOrderRow } from '@/server/queries/admin-orders';

export async function OrderTable({
  orders,
  locale,
}: {
  orders: AdminOrderRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.orders');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="overflow-x-auto rounded-sm border border-bone/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bone/10 bg-ash/40 text-left text-xs uppercase tracking-widest text-bone/60">
            <th className="p-3">{t('number')}</th>
            <th className="p-3">{t('date')}</th>
            <th className="p-3">{t('customer')}</th>
            <th className="p-3">{t('items')}</th>
            <th className="p-3">{t('total')}</th>
            <th className="p-3">{t('statusCol')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-bone/10 hover:bg-ash/30">
              <td className="p-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="font-display text-base hover:text-gold"
                >
                  {o.number}
                </Link>
              </td>
              <td className="p-3 text-bone/70">{dateFormat.format(o.createdAt)}</td>
              <td className="p-3">
                <p className="text-bone">{o.user.name ?? o.user.email}</p>
                <p className="text-xs text-bone/50">{o.user.email}</p>
              </td>
              <td className="p-3">{o.items.length}</td>
              <td className="p-3 font-display">{formatUah(o.totalUah, locale)}</td>
              <td className="p-3">
                <OrderStatusBadge status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
