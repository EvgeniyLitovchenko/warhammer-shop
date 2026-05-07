import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('product');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-7xl text-blood">404</p>
      <h1 className="mt-6 font-display text-3xl uppercase tracking-tight">
        {t('notFound.title')}
      </h1>
      <p className="mt-3 max-w-md text-bone/60">{t('notFound.subtitle')}</p>
      <Link
        href="/catalog"
        className="mt-8 rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
      >
        {t('backToCatalog')}
      </Link>
    </main>
  );
}
