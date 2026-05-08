import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { OrderCard } from '@/components/order-card';
import { Link, type Locale } from '@/i18n/routing';
import { listUserOrders } from '@/server/queries/orders';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orders' });
  return { title: t('title') };
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const orders = await listUserOrders(session.user.id);
  const t = await getTranslations('orders');
  const lang = locale as Locale;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">{t('subtitle')}</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-12 text-center">
          <p className="text-bone/60">{t('empty')}</p>
          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
          >
            {t('browseCatalog')}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} locale={lang} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
