import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { getAdminProduct, listAdminTaxonomy } from '@/server/queries/admin-products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  const product = await getAdminProduct(id);
  return { title: product ? `${product.name}` : t('editTitle') };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.products');

  const product = await getAdminProduct(id);
  if (!product) notFound();

  const { factions, categories } = await listAdminTaxonomy();

  return (
    <div className="max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('editTitle')}
        </h1>
        <p className="mt-2 text-bone/60">
          {product.name} · {product.sku}
        </p>
      </header>
      <div className="mt-8">
        <ProductForm product={product} factions={factions} categories={categories} />
      </div>
    </div>
  );
}
