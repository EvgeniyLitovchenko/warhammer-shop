import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <main className="relative min-h-screen overflow-hidden bg-grain">
      <div className="absolute inset-0 bg-gradient-to-b from-ash via-steel/40 to-ash" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">{t('eyebrow')}</p>
        <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-bone/75">{t('subtitle')}</p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/catalog"
            className="rounded-sm bg-blood px-7 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
          >
            {t('ctaCatalog')}
          </Link>
          <Link
            href="/about"
            className="rounded-sm border border-bone/20 px-7 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:border-bone/60"
          >
            {t('ctaAbout')}
          </Link>
        </div>
      </section>
    </main>
  );
}
