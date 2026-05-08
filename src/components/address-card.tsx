import type { Address } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { DeleteAddressButton } from './delete-address-button';
import { SetDefaultAddressButton } from './set-default-address-button';

export async function AddressCard({ address }: { address: Address }) {
  const t = await getTranslations('addresses');

  return (
    <article className="relative flex flex-col gap-3 rounded-sm border border-bone/10 bg-ash/40 p-6">
      {address.isDefault && (
        <span className="absolute right-4 top-4 rounded-sm border border-gold/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
          {t('default')}
        </span>
      )}

      <p className="font-display text-lg">{address.fullName}</p>
      <p className="text-sm text-bone/70">{address.phone}</p>

      <div className="text-sm text-bone/80">
        <p>{address.street}</p>
        <p>
          {address.city}, {address.postalCode}
        </p>
        <p>
          {address.region}, {address.country}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-bone/10 pt-4">
        <Link
          href={`/account/addresses/${address.id}/edit`}
          className="text-xs uppercase tracking-widest text-bone/80 transition hover:text-gold"
        >
          {t('edit')}
        </Link>
        {!address.isDefault && <SetDefaultAddressButton addressId={address.id} />}
        <DeleteAddressButton addressId={address.id} />
      </div>
    </article>
  );
}
