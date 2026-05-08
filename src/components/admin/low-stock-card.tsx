import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import type { LowStockRow } from '@/server/queries/dashboard';

export async function LowStockCard({
  products,
  locale,
}: {
  products: LowStockRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.dashboard');

  if (products.length === 0) return null;

  return (
    <article className="rounded-sm border border-amber-400/40 bg-amber-400/5 p-6">
      <header className="flex items-center gap-3">
        <span className="text-amber-400">⚠</span>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-amber-300">
          {t('lowStock')}
        </h2>
      </header>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => {
          const name = locale === 'en' ? product.nameEn : product.name;
          const image = product.images[0];
          const stock = product.inventory?.stock ?? 0;
          return (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="flex items-center gap-3 rounded-sm border border-bone/10 bg-ash/40 p-3 transition hover:border-amber-400/60"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-sm border border-bone/10 bg-ash">
                {image && (
                  <Image src={image.url} alt={name} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs">{name}</p>
                <p className="font-display text-sm text-amber-400">
                  {stock === 0 ? t('outOfStock') : t('stockLeft', { n: stock })}
                </p>
              </div>
            </Link>
          );
        })}
      </ul>
    </article>
  );
}
