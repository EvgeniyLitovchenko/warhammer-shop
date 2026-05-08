import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AddressCard } from '@/components/address-card';
import { Link } from '@/i18n/routing';
import { listUserAddresses } from '@/server/queries/addresses';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'addresses' });
  return { title: t('title') };
}

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const addresses = await listUserAddresses(session.user.id);
  const t = await getTranslations('addresses');

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-bone/60">{t('subtitle')}</p>
        </div>
        <Link
          href="/account/addresses/new"
          className="rounded-sm bg-blood px-5 py-3 font-display text-xs uppercase tracking-widest text-bone transition hover:bg-blood/80"
        >
          {t('addNew')}
        </Link>
      </header>

      {addresses.length === 0 ? (
        <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-12 text-center">
          <p className="text-bone/60">{t('empty')}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <AddressCard address={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
