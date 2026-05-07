import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import type { ProductListItem } from '@/server/queries/products';
import type { Locale } from '@/i18n/routing';

export function ProductCard({
  product,
  locale,
}: {
  product: ProductListItem;
  locale: Locale;
}) {
  const name = locale === 'en' ? product.nameEn : product.name;
  const factionName = product.faction
    ? locale === 'en'
      ? product.faction.nameEn
      : product.faction.name
    : null;
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-bone/10 bg-ash/40 transition hover:border-gold/40"
    >
      <div className="relative aspect-square overflow-hidden bg-ash">
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {factionName && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold/70">{factionName}</p>
        )}
        <h3 className="font-display text-lg leading-tight">{name}</h3>

        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-xl">{formatUah(product.priceUah, locale)}</span>
          {product.comparePriceUah && product.comparePriceUah > product.priceUah && (
            <span className="text-sm text-bone/40 line-through">
              {formatUah(product.comparePriceUah, locale)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
