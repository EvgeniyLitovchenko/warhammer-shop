import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import type { TopProductRow } from '@/server/queries/dashboard';

export async function TopProductsCard({
  products,
  locale,
}: {
  products: TopProductRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.dashboard');

  return (
    <article className="rounded-sm border border-bone/10 bg-ash/40 p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.3em] text-bone/60">
        {t('topProducts')}
      </h2>

      {products.length === 0 ? (
        <p className="mt-4 text-sm text-bone/50">{t('noSales')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {products.map(({ product, units }, index) => {
            const name = locale === 'en' ? product.nameEn : product.name;
            const image = product.images[0];
            return (
              <li key={product.id} className="flex items-center gap-4">
                <span className="font-display text-2xl text-gold/70 w-6">{index + 1}</span>
                <div className="relative h-12 w-12 overflow-hidden rounded-sm border border-bone/10 bg-ash">
                  {image && (
                    <Image src={image.url} alt={name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 text-sm hover:text-gold"
                >
                  {name}
                </Link>
                <span className="font-display text-base">
                  {units}{' '}
                  <span className="text-xs uppercase tracking-widest text-bone/50">
                    {t('units')}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
