import { getTranslations } from 'next-intl/server';
import { StarRating } from '@/components/star-rating';
import { Link, type Locale } from '@/i18n/routing';
import type { AdminReviewRow } from '@/server/queries/reviews';
import { ReviewActions } from './review-actions';

export async function ReviewTable({
  reviews,
  locale,
}: {
  reviews: AdminReviewRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.reviews');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => {
        const productName = locale === 'en' ? r.product.nameEn : r.product.name;
        return (
          <li key={r.id} className="rounded-sm border border-bone/10 bg-ash/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <StarRating value={r.rating} />
                  {r.approved ? (
                    <span className="rounded-sm border border-emerald-400/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      {t('approved')}
                    </span>
                  ) : (
                    <span className="rounded-sm border border-amber-400/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                      {t('pending')}
                    </span>
                  )}
                </div>
                {r.title && <p className="font-display text-base">{r.title}</p>}
              </div>
              <ReviewActions reviewId={r.id} approved={r.approved} />
            </div>

            <p className="mt-3 text-sm text-bone/80">{r.body}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-bone/50">
              <span>
                {t('product')}:{' '}
                <Link
                  href={`/products/${r.product.slug}`}
                  className="text-bone/80 hover:text-gold"
                >
                  {productName}
                </Link>
              </span>
              <span>
                {t('author')}: {r.user.name ?? r.user.email}
              </span>
              <span>{dateFormat.format(r.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
