import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { getUserOrder } from '@/server/queries/orders';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return { title: 'Order' };
  const order = await getUserOrder(session.user.id, id);
  return { title: order ? order.number : 'Order' };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const order = await getUserOrder(session.user.id, id);
  if (!order) notFound();

  const t = await getTranslations('orders');
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
          href="/account/orders"
          className="text-xs uppercase tracking-widest text-bone/50 transition hover:text-gold"
        >
          ← {t('backToOrders')}
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

      <section className="rounded-sm border border-bone/10 bg-ash/40">
        <ul className="divide-y divide-bone/10">
          {order.items.map((item) => {
            const image = item.product.images[0];
            return (
              <li key={item.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-4 p-4">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative aspect-square overflow-hidden rounded-sm border border-bone/10 bg-ash"
                >
                  {image && (
                    <Image src={image.url} alt={item.name} fill sizes="60px" className="object-cover" />
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
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
            {t('shippingTo')}
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
            {t(`shippingMethod.${order.shippingMethod}`)} · {t(`paymentMethod.${order.paymentMethod}`)}
          </p>
        </div>

        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
            {t('totals')}
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-bone/60">{t('subtotal')}</dt>
              <dd>{formatUah(subtotal, lang)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bone/60">{t('shipping')}</dt>
              <dd>
                {order.shippingUah === 0 ? t('free') : formatUah(order.shippingUah, lang)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-bone/10 pt-2">
              <dt className="text-bone/60">{t('total')}</dt>
              <dd className="font-display text-lg">{formatUah(order.totalUah, lang)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {order.history.length > 0 && (
        <section>
          <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
            {t('history')}
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
      )}
    </div>
  );
}
