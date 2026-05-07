import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { pageRange } from '@/lib/pagination';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const t = useTranslations('catalog');

  if (totalPages <= 1) return null;

  const items = pageRange(page, totalPages);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2 text-sm" aria-label={t('pagination')}>
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="rounded-sm border border-bone/20 px-3 py-2 transition hover:border-gold/60"
        >
          {t('prev')}
        </Link>
      ) : (
        <span className="rounded-sm border border-bone/10 px-3 py-2 text-bone/30">
          {t('prev')}
        </span>
      )}

      {items.map((it, idx) =>
        it === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-2 text-bone/40">
            …
          </span>
        ) : it === page ? (
          <span
            key={it}
            aria-current="page"
            className="rounded-sm border border-gold/60 bg-gold/10 px-3 py-2 text-gold"
          >
            {it}
          </span>
        ) : (
          <Link
            key={it}
            href={buildHref(it)}
            className="rounded-sm border border-bone/20 px-3 py-2 transition hover:border-gold/60"
          >
            {it}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="rounded-sm border border-bone/20 px-3 py-2 transition hover:border-gold/60"
        >
          {t('next')}
        </Link>
      ) : (
        <span className="rounded-sm border border-bone/10 px-3 py-2 text-bone/30">
          {t('next')}
        </span>
      )}
    </nav>
  );
}
