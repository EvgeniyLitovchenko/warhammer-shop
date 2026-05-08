import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { listFactions } from '@/server/queries/taxonomy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'factions' });
  return { title: t('title') };
}

export default async function FactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as Locale;
  const t = await getTranslations('factions');

  const factions = await listFactions(null);

  const grouped = {
    WARHAMMER_40K: factions.filter((f) => f.system === 'WARHAMMER_40K'),
    AGE_OF_SIGMAR: factions.filter((f) => f.system === 'AGE_OF_SIGMAR'),
    OTHER: factions.filter(
      (f) => f.system !== 'WARHAMMER_40K' && f.system !== 'AGE_OF_SIGMAR',
    ),
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <header className="border-b border-bone/10 pb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-3xl text-bone/60">{t('subtitle')}</p>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {(['WARHAMMER_40K', 'AGE_OF_SIGMAR'] as const).map((system) => {
          const list = grouped[system];
          if (list.length === 0) return null;
          return (
            <section key={system}>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                {system === 'WARHAMMER_40K' ? 'Warhammer 40,000' : 'Age of Sigmar'}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((faction) => {
                  const name = lang === 'en' ? faction.nameEn : faction.name;
                  return (
                    <li key={faction.id}>
                      <Link
                        href={`/catalog?faction=${faction.slug}`}
                        className="flex h-full flex-col gap-2 rounded-sm border border-bone/10 bg-ash/40 p-5 transition hover:border-gold/40"
                      >
                        <p className="font-display text-lg uppercase tracking-tight">{name}</p>
                        {faction.description && (
                          <p className="text-sm text-bone/70">{faction.description}</p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
