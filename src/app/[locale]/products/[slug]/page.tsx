import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Reviews } from '@/components/reviews';
import { RelatedProducts } from '@/components/related-products';
import { ProductGallery } from '@/components/product-gallery';
import { ReviewForm } from '@/components/review-form';
import { StarRating } from '@/components/star-rating';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { averageRating } from '@/lib/reviews';
import { getProductBySlug, listRelatedProducts } from '@/server/queries/products';
import { canUserReviewProduct, getUserReview } from '@/server/queries/reviews';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Not found' };

  const name = locale === 'en' ? product.nameEn : product.name;
  const description = locale === 'en' ? product.descriptionEn : product.description;
  return {
    title: name,
    description: description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations('product');
  const lang = locale as Locale;
  const name = lang === 'en' ? product.nameEn : product.name;
  const description = lang === 'en' ? product.descriptionEn : product.description;
  const factionName = product.faction
    ? lang === 'en'
      ? product.faction.nameEn
      : product.faction.name
    : null;
  const categoryName = lang === 'en' ? product.category.nameEn : product.category.name;
  const stock = product.inventory?.stock ?? 0;
  const avg = averageRating(product.reviews.map((r) => r.rating));

  const related = await listRelatedProducts({
    productId: product.id,
    factionId: product.factionId,
    categoryId: product.categoryId,
  });

  const session = await auth();
  const canReview = session?.user
    ? await canUserReviewProduct(session.user.id, product.id)
    : false;
  const userReview = session?.user
    ? await getUserReview(session.user.id, product.id)
    : null;

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <nav className="text-xs uppercase tracking-widest text-bone/50">
        <Link href="/catalog" className="hover:text-gold">
          {t('backToCatalog')}
        </Link>
        <span className="px-2">/</span>
        <span className="text-bone/30">{categoryName}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={name} />

        <div className="flex flex-col gap-6">
          {factionName && (
            <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{factionName}</p>
          )}
          <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            {name}
          </h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-bone/70">
              <StarRating value={avg} />
              <span>
                {avg.toFixed(1)} · {t('reviews.count', { n: product.reviews.length })}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl">{formatUah(product.priceUah, lang)}</span>
            {product.comparePriceUah && product.comparePriceUah > product.priceUah && (
              <span className="text-lg text-bone/40 line-through">
                {formatUah(product.comparePriceUah, lang)}
              </span>
            )}
          </div>

          <p
            className={
              stock > 0
                ? 'text-sm uppercase tracking-widest text-emerald-400/90'
                : 'text-sm uppercase tracking-widest text-red-400/90'
            }
          >
            {stock > 0 ? t('inStock', { n: stock }) : t('outOfStock')}
          </p>

          <AddToCartButton productId={product.id} disabled={stock === 0} />

          <p className="mt-2 leading-relaxed text-bone/80">{description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-bone/10 pt-6 text-sm">
            <div>
              <dt className="uppercase tracking-widest text-bone/50">{t('sku')}</dt>
              <dd className="mt-1 text-bone">{product.sku}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-widest text-bone/50">{t('category')}</dt>
              <dd className="mt-1 text-bone">{categoryName}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-16">
        <Reviews reviews={product.reviews} locale={lang} />

        {!session?.user ? (
          <section className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-6 text-center text-sm text-bone/60">
            <Link href="/auth/login" className="text-gold hover:underline">
              {t('reviewForm.signInToReview')}
            </Link>
          </section>
        ) : canReview ? (
          <ReviewForm productId={product.id} existing={userReview} />
        ) : null}

        <RelatedProducts products={related} locale={lang} />
      </div>
    </main>
  );
}
