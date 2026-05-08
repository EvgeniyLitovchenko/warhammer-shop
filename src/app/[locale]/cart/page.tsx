import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CartLine } from '@/components/cart-line';
import { CartSummary } from '@/components/cart-summary';
import { EmptyCart } from '@/components/empty-cart';
import { type Locale } from '@/i18n/routing';
import { getCartView } from '@/server/queries/cart';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return { title: t('title') };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;

  const { cart, totals } = await getCartView();
  const t = await getTranslations('cart');

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <header className="border-b border-bone/10 pb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          {t('title')}
        </h1>
        {!isEmpty && (
          <p className="mt-3 text-bone/60">{t('count', { n: totals.totalQty })}</p>
        )}
      </header>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col">
            {cart.items.map((item) => (
              <CartLine key={item.id} item={item} locale={lang} />
            ))}
          </ul>
          <CartSummary totals={totals} locale={lang} />
        </div>
      )}
    </main>
  );
}
