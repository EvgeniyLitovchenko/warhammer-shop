import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AddressForm } from '@/components/address-form';
import { getUserAddress } from '@/server/queries/addresses';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'addresses' });
  return { title: t('editTitle') };
}

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const address = await getUserAddress(session.user.id, id);
  if (!address) notFound();

  const t = await getTranslations('addresses');

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {t('editTitle')}
        </h1>
        <p className="mt-2 text-bone/60">{t('editSubtitle')}</p>
      </header>
      <div className="mt-8">
        <AddressForm address={address} />
      </div>
    </div>
  );
}
