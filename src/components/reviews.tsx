import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { averageRating } from '@/lib/reviews';
import type { ProductDetail } from '@/server/queries/products';
import { StarRating } from './star-rating';

export async function Reviews({
  reviews,
  locale,
}: {
  reviews: ProductDetail['reviews'];
  locale: Locale;
}) {
  const t = await getTranslations('product.reviews');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (reviews.length === 0) {
    return (
      <section className="border-t border-bone/10 pt-12">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-4 text-bone/60">{t('empty')}</p>
      </section>
    );
  }

  const avg = averageRating(reviews.map((r) => r.rating));

  return (
    <section className="border-t border-bone/10 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
          {t('title')}
        </h2>
        <div className="flex items-center gap-3">
          <StarRating value={avg} size="md" />
          <span className="text-sm text-bone/70">
            {avg.toFixed(1)} · {t('count', { n: reviews.length })}
          </span>
        </div>
      </div>

      <ul className="mt-8 flex flex-col gap-6">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-sm border border-bone/10 bg-ash/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <StarRating value={r.rating} />
                {r.title && <span className="font-display text-lg">{r.title}</span>}
              </div>
              <span className="text-xs uppercase tracking-widest text-bone/50">
                {r.user.name ?? r.user.email} · {dateFormat.format(r.createdAt)}
              </span>
            </div>
            <p className="mt-3 text-bone/80">{r.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
