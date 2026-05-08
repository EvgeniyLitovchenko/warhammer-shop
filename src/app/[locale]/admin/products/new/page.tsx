import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductForm } from '@/components/admin/product-form';
import { listAdminTaxonomy } from '@/server/queries/admin-products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return { title: t('newTitle') };
}

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.products');

  const { factions, categories } = await listAdminTaxonomy();

  return (
    <div className="max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('newTitle')}
        </h1>
        <p className="mt-2 text-bone/60">{t('newSubtitle')}</p>
      </header>
      <div className="mt-8">
        <ProductForm factions={factions} categories={categories} />
      </div>
    </div>
  );
}
