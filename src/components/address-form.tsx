'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import type { Address } from '@prisma/client';
import { Link } from '@/i18n/routing';
import {
  saveAddressAction,
  type AddressFormState,
} from '@/server/actions/addresses';

export function AddressForm({ address }: { address?: Address }) {
  const t = useTranslations('addresses');
  const [state, action, pending] = useActionState<AddressFormState | undefined, FormData>(
    saveAddressAction,
    undefined,
  );

  const fieldError = (name: string) => state?.fieldErrors?.[name as never]?.[0];
  const value = (name: keyof Address): string => {
    const fromState = state?.values?.[name as keyof typeof state.values];
    if (fromState !== undefined) return fromState;
    const fromAddress = address?.[name];
    return typeof fromAddress === 'string' ? fromAddress : '';
  };

  return (
    <form action={action} className="flex flex-col gap-5">
      {address?.id && <input type="hidden" name="id" value={address.id} />}

      <Field label={t('fullName')} error={fieldError('fullName')}>
        <input
          name="fullName"
          required
          minLength={2}
          maxLength={100}
          defaultValue={value('fullName')}
          autoComplete="name"
          className="address-input"
        />
      </Field>

      <Field label={t('phone')} error={fieldError('phone')}>
        <input
          name="phone"
          type="tel"
          required
          defaultValue={value('phone')}
          autoComplete="tel"
          placeholder="+380 50 123 4567"
          className="address-input"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('country')} error={fieldError('country')}>
          <input
            name="country"
            required
            maxLength={2}
            defaultValue={address?.country ?? 'UA'}
            autoComplete="country"
            className="address-input uppercase"
          />
        </Field>
        <Field label={t('postalCode')} error={fieldError('postalCode')}>
          <input
            name="postalCode"
            required
            defaultValue={value('postalCode')}
            autoComplete="postal-code"
            className="address-input"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('region')} error={fieldError('region')}>
          <input
            name="region"
            required
            defaultValue={value('region')}
            autoComplete="address-level1"
            className="address-input"
          />
        </Field>
        <Field label={t('city')} error={fieldError('city')}>
          <input
            name="city"
            required
            defaultValue={value('city')}
            autoComplete="address-level2"
            className="address-input"
          />
        </Field>
      </div>

      <Field label={t('street')} error={fieldError('street')}>
        <input
          name="street"
          required
          defaultValue={value('street')}
          autoComplete="address-line1"
          className="address-input"
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-bone/80">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="accent-gold"
        />
        {t('setDefault')}
      </label>

      {state?.error === 'unknown' && <p className="text-sm text-red-400">{t('errors.unknown')}</p>}
      {state?.error === 'unauthorized' && (
        <p className="text-sm text-red-400">{t('errors.unauthorized')}</p>
      )}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-60"
        >
          {pending ? t('saving') : t('save')}
        </button>
        <Link
          href="/account/addresses"
          className="text-sm uppercase tracking-widest text-bone/60 transition hover:text-bone"
        >
          {t('cancel')}
        </Link>
      </div>

      <style>{`
        .address-input {
          width: 100%;
          border: 1px solid rgb(231 223 198 / 0.2);
          background: rgb(26 28 31 / 0.4);
          border-radius: 2px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .address-input:focus {
          border-color: rgb(201 165 88 / 0.6);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="uppercase tracking-wider text-bone/70">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
