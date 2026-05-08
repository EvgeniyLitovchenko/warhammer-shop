import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { type CartTotals } from '@/lib/cart';
import { formatUah } from '@/lib/money';

export async function CartSummary({
  totals,
  locale,
}: {
  totals: CartTotals;
  locale: Locale;
}) {
  const t = await getTranslations('cart');

  return (
    <aside className="rounded-sm border border-bone/10 bg-ash/40 p-6">
      <h2 className="font-display text-xl font-black uppercase tracking-tight">
        {t('summary')}
      </h2>

      <dl className="mt-6 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-bone/60">{t('items')}</dt>
          <dd>{totals.totalQty}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-bone/60">{t('subtotal')}</dt>
          <dd className="font-display text-base">{formatUah(totals.subtotalUah, locale)}</dd>
        </div>
        <div className="flex items-center justify-between text-bone/40">
          <dt>{t('shipping')}</dt>
          <dd className="text-xs uppercase tracking-widest">{t('atCheckout')}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between border-t border-bone/10 pt-4">
        <span className="text-xs uppercase tracking-widest text-bone/60">{t('total')}</span>
        <span className="font-display text-2xl">{formatUah(totals.subtotalUah, locale)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-sm bg-blood px-6 py-3 text-center font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
      >
        {t('checkout')}
      </Link>
    </aside>
  );
}
