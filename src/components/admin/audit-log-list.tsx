import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { AuditEntry } from '@/server/queries/admin-orders';

export async function AuditLogList({
  entries,
  locale,
}: {
  entries: AuditEntry[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.orders.audit');
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (entries.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-6 text-center text-sm text-bone/60">
        {t('empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {entries.map((entry) => {
        const payload = entry.payload as { from?: string; to?: string; comment?: string | null } | null;
        return (
          <li
            key={entry.id}
            className="rounded-sm border border-bone/10 bg-ash/40 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-bone/60">{entry.action}</span>
              <span className="text-xs uppercase tracking-widest text-bone/50">
                {dateFormat.format(entry.createdAt)}
              </span>
            </div>
            {payload?.from && payload?.to && (
              <p className="mt-2 text-bone/80">
                <span className="text-bone/50">{payload.from}</span>
                <span className="mx-2 text-gold">→</span>
                <span>{payload.to}</span>
              </p>
            )}
            {payload?.comment && <p className="mt-1 text-bone/60">«{payload.comment}»</p>}
            <p className="mt-2 text-xs text-bone/50">
              {t('by')}: {entry.actor ? (entry.actor.name ?? entry.actor.email) : t('system')}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
