import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title') };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
      <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
        {t('title')}
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-bone/80 leading-relaxed">
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">{t('shippingTitle')}</p>
          <p className="mt-3 text-sm">{t('shippingText')}</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">{t('paymentTitle')}</p>
          <p className="mt-3 text-sm">{t('paymentText')}</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">{t('returnsTitle')}</p>
          <p className="mt-3 text-sm">{t('returnsText')}</p>
        </div>
      </section>

      <div className="mt-12 flex justify-center">
        <Link
          href="/catalog"
          className="rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80"
        >
          {t('cta')}
        </Link>
      </div>
    </main>
  );
}
