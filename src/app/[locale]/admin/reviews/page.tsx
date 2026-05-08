import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReviewStatusFilter } from '@/components/admin/review-status-filter';
import { ReviewTable } from '@/components/admin/review-table';
import { type Locale } from '@/i18n/routing';
import { listAdminReviews } from '@/server/queries/reviews';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.reviews' });
  return { title: t('title') };
}

const VALID_FILTERS = ['pending', 'approved', 'all'] as const;
type Filter = (typeof VALID_FILTERS)[number];

export default async function AdminReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const filter: Filter = (VALID_FILTERS as readonly string[]).includes(sp.filter ?? '')
    ? (sp.filter as Filter)
    : 'pending';
  const approvedFilter =
    filter === 'approved' ? true : filter === 'pending' ? false : undefined;

  const reviews = await listAdminReviews(approvedFilter);
  const t = await getTranslations('admin.reviews');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">{t('count', { n: reviews.length })}</p>
      </header>

      <ReviewStatusFilter value={filter} />

      {reviews.length === 0 ? (
        <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-12 text-center">
          <p className="text-bone/60">{t('empty')}</p>
        </div>
      ) : (
        <ReviewTable reviews={reviews} locale={locale as Locale} />
      )}
    </div>
  );
}
