import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/forms/login-form';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { callbackUrl } = await searchParams;
  const t = await getTranslations('auth');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('loginTitle')}
        </h1>
        <p className="mt-2 text-sm text-bone/60">{t('loginSubtitle')}</p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
