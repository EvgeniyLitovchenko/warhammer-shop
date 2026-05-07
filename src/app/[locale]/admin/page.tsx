import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">{t('subtitle')}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('products')}</p>
          <p className="mt-2 font-display text-3xl">—</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('orders')}</p>
          <p className="mt-2 font-display text-3xl">—</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('users')}</p>
          <p className="mt-2 font-display text-3xl">—</p>
        </div>
      </section>
    </div>
  );
}
