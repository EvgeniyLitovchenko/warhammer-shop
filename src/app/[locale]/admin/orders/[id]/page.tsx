import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AuditLogList } from '@/components/admin/audit-log-list';
import { OrderStatusForm } from '@/components/admin/order-status-form';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { getAdminOrder, getOrderAudit } from '@/server/queries/admin-orders';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrder(id);
  return { title: order ? order.number : 'Order' };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await getAdminOrder(id);
  if (!order) notFound();

  const audit = await getOrderAudit(id);
  const t = await getTranslations('admin.orders');
  const tOrders = await getTranslations('orders');
  const lang = locale as Locale;
  const dateFormat = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.totalUah - order.shippingUah;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link
          href="/admin/orders"
          className="text-xs uppercase tracking-widest text-bone/50 transition hover:text-gold"
        >
          ← {t('backToList')}
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
              {order.number}
            </h1>
            <p className="mt-2 text-sm text-bone/60">{dateFormat.format(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-sm border border-bone/10 bg-ash/40 p-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
              {t('customer')}
            </h2>
            <p className="mt-3 font-display text-base">
              {order.user.name ?? order.user.email}
            </p>
            <p className="text-sm text-bone/70">{order.user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-gold/70">
              {order.user.role}
            </p>
          </section>

          <section className="rounded-sm border border-bone/10 bg-ash/40">
            <ul className="divide-y divide-bone/10">
              {order.items.map((item) => {
                const image = item.product.images[0];
                return (
                  <li
                    key={item.id}
                    className="grid grid-cols-[60px_1fr_auto] items-center gap-4 p-4"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative aspect-square overflow-hidden rounded-sm border border-bone/10 bg-ash"
                    >
                      {image && (
                        <Image
                          src={image.url}
                          alt={item.name}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-display text-base hover:text-gold"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-bone/50">
                        {formatUah(item.priceUah, lang)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-display text-base">
                      {formatUah(item.priceUah * item.quantity, lang)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-sm border border-bone/10 bg-ash/40 p-6">
              <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
                {tOrders('shippingTo')}
              </h2>
              {order.address ? (
                <div className="mt-3 text-sm">
                  <p className="font-display text-base">{order.address.fullName}</p>
                  <p className="text-bone/70">{order.address.phone}</p>
                  <p className="mt-2 text-bone/80">
                    {order.address.street}, {order.address.city}, {order.address.postalCode}
                  </p>
                  <p className="text-bone/60">
                    {order.address.region}, {order.address.country}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-bone/40">—</p>
              )}
              <p className="mt-4 text-xs uppercase tracking-widest text-bone/50">
                {tOrders(`shippingMethod.${order.shippingMethod}`)} ·{' '}
                {tOrders(`paymentMethod.${order.paymentMethod}`)}
              </p>
            </section>

            <section className="rounded-sm border border-bone/10 bg-ash/40 p-6">
              <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
                {tOrders('totals')}
              </h2>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-bone/60">{tOrders('subtotal')}</dt>
                  <dd>{formatUah(subtotal, lang)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bone/60">{tOrders('shipping')}</dt>
                  <dd>
                    {order.shippingUah === 0
                      ? tOrders('free')
                      : formatUah(order.shippingUah, lang)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-bone/10 pt-2">
                  <dt className="text-bone/60">{tOrders('total')}</dt>
                  <dd className="font-display text-lg">
                    {formatUah(order.totalUah, lang)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section>
            <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
              {tOrders('history')}
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {order.history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-sm border border-bone/10 bg-ash/40 px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <OrderStatusBadge status={entry.status} />
                    {entry.comment && <span className="text-bone/70">{entry.comment}</span>}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-bone/50">
                    {dateFormat.format(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
              {t('audit.title')}
            </h2>
            <div className="mt-3">
              <AuditLogList entries={audit} locale={lang} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <OrderStatusForm orderId={order.id} current={order.status} />
        </aside>
      </div>
    </div>
  );
}
