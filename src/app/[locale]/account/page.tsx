import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations('account');

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">
          {t('greeting', { name: session?.user?.name ?? session?.user?.email ?? '' })}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('email')}</p>
          <p className="mt-2 text-lg">{session?.user?.email}</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('role')}</p>
          <p className="mt-2 text-lg">{session?.user?.role}</p>
        </div>
        <div className="rounded-sm border border-bone/10 bg-ash/40 p-6">
          <p className="text-xs uppercase tracking-widest text-bone/50">{t('orders')}</p>
          <p className="mt-2 text-lg">0</p>
        </div>
      </section>
    </div>
  );
}
