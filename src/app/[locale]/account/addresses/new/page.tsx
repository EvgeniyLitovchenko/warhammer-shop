import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AddressForm } from '@/components/address-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'addresses' });
  return { title: t('addNew') };
}

export default async function NewAddressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('addresses');

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('newTitle')}
        </h1>
        <p className="mt-2 text-bone/60">{t('newSubtitle')}</p>
      </header>
      <div className="mt-8">
        <AddressForm />
      </div>
    </div>
  );
}
