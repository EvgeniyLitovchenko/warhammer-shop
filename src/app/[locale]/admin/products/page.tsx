import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductTable } from '@/components/admin/product-table';
import { Link, type Locale } from '@/i18n/routing';
import { listAllProductsForAdmin } from '@/server/queries/admin-products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return { title: t('title') };
}

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.products');
  const lang = locale as Locale;

  const products = await listAllProductsForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-bone/60">{t('subtitle', { n: products.length })}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-sm bg-blood px-5 py-3 font-display text-xs uppercase tracking-widest text-bone transition hover:bg-blood/80"
        >
          {t('addNew')}
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-12 text-center">
          <p className="text-bone/60">{t('empty')}</p>
        </div>
      ) : (
        <ProductTable products={products} locale={lang} />
      )}
    </div>
  );
}
