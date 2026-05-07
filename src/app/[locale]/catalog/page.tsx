import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/product-card';
import { Pagination } from '@/components/pagination';
import { SortSelect } from '@/components/sort-select';
import { type Locale } from '@/i18n/routing';
import { parsePage, parseSort, totalPages } from '@/lib/pagination';
import { listProducts } from '@/server/queries/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return { title: t('title') };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const page = parsePage(typeof sp.page === 'string' ? sp.page : undefined);
  const sort = parseSort(typeof sp.sort === 'string' ? sp.sort : undefined);

  const { items, total, pageSize } = await listProducts({ page, sort });
  const pages = totalPages(total, pageSize);
  const t = await getTranslations('catalog');

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sort !== 'newest') params.set('sort', sort);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <header className="flex flex-col gap-6 border-b border-bone/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-bone/60">{t('total', { count: total })}</p>
        </div>
        <SortSelect value={sort} />
      </header>

      {items.length === 0 ? (
        <p className="py-24 text-center text-bone/60">{t('empty')}</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} locale={locale as Locale} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={pages} buildHref={buildHref} />
    </main>
  );
}
