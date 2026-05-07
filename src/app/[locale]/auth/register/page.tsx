import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RegisterForm } from '@/components/forms/register-form';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('registerTitle')}
        </h1>
        <p className="mt-2 text-sm text-bone/60">{t('registerSubtitle')}</p>
      </div>
      <RegisterForm />
    </div>
  );
}
