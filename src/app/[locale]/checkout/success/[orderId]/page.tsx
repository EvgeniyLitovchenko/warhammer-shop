import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { getUserOrder } from '@/server/queries/orders';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout.success' });
  return { title: t('title') };
}

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const order = await getUserOrder(session.user.id, orderId);
  if (!order) notFound();

  const t = await getTranslations('checkout.success');
  const lang = locale as Locale;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="h-20 w-20 text-gold"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>

      <h1 className="mt-6 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-4 text-bone/70">{t('subtitle', { number: order.number })}</p>

      <div className="mt-10 w-full rounded-sm border border-bone/10 bg-ash/40 p-6 text-left">
        <h2 className="font-display text-lg uppercase tracking-tight">{t('summary')}</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-bone/60">{t('total')}</dt>
            <dd className="font-display text-lg">{formatUah(order.totalUah, lang)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bone/60">{t('items')}</dt>
            <dd>{order.items.length}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href={`/account/orders/${order.id}`}
          className="rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
        >
          {t('viewOrder')}
        </Link>
        <Link
          href="/catalog"
          className="rounded-sm border border-bone/20 px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:border-gold/60"
        >
          {t('continueShopping')}
        </Link>
      </div>
    </main>
  );
}
