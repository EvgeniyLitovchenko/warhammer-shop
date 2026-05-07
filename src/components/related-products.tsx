import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { ProductListItem } from '@/server/queries/products';
import { ProductCard } from './product-card';

export async function RelatedProducts({
  products,
  locale,
}: {
  products: ProductListItem[];
  locale: Locale;
}) {
  const t = await getTranslations('product');

  if (products.length === 0) return null;

  return (
    <section className="border-t border-bone/10 pt-12">
      <h2 className="font-display text-2xl font-black uppercase tracking-tight">
        {t('related')}
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
