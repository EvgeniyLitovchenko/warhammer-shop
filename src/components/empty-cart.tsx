import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function EmptyCart() {
  const t = await getTranslations('cart');

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="h-20 w-20 text-bone/30"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <h2 className="mt-6 font-display text-2xl uppercase tracking-tight">
        {t('emptyTitle')}
      </h2>
      <p className="mt-2 text-bone/60">{t('emptySubtitle')}</p>
      <Link
        href="/catalog"
        className="mt-8 rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
      >
        {t('browseCatalog')}
      </Link>
    </div>
  );
}
