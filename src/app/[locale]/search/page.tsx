import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/product-card';
import type { Locale } from '@/i18n/routing';
import { isQueryValid, normalizeQuery } from '@/lib/search';
import { searchProducts } from '@/server/queries/search';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  return { title: t('title') };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const query = normalizeQuery(raw);
  const valid = isQueryValid(query);

  const items = valid ? await searchProducts(query) : [];
  const t = await getTranslations('search');
  const lang = locale as Locale;

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-12">
      <header className="border-b border-bone/10 pb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          {t('title')}
        </h1>
        {valid ? (
          <p className="mt-3 text-bone/60">
            {t('queryFor', { q: query })} · {t('count', { n: items.length })}
          </p>
        ) : (
          <p className="mt-3 text-bone/60">{t('typeToSearch')}</p>
        )}
      </header>

      {valid && items.length === 0 && (
        <p className="py-24 text-center text-bone/60">{t('noResults', { q: query })}</p>
      )}

      {items.length > 0 && (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} locale={lang} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
