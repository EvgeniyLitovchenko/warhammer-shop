'use client';

import type { Address, PaymentMethod, ShippingMethod } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { shippingCostUah } from '@/lib/shipping';
import {
  placeOrderAction,
  type PlaceOrderState,
} from '@/server/actions/checkout';
import type { CartWithItems } from '@/server/queries/cart';

const SHIPPING_METHODS: ShippingMethod[] = ['NOVA_POSHTA', 'PICKUP'];
const PAYMENT_METHODS: PaymentMethod[] = ['CASH_ON_DELIVERY', 'CARD_ON_DELIVERY'];

export function CheckoutForm({
  cart,
  addresses,
  locale,
}: {
  cart: CartWithItems;
  addresses: Address[];
  locale: Locale;
}) {
  const t = useTranslations('checkout');
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('NOVA_POSHTA');
  const [state, action, pending] = useActionState<PlaceOrderState | undefined, FormData>(
    placeOrderAction,
    undefined,
  );

  const subtotalUah = cart.items.reduce(
    (sum, item) => sum + item.product.priceUah * item.quantity,
    0,
  );
  const shippingUah = shippingCostUah(shippingMethod);
  const totalUah = subtotalUah + shippingUah;

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-10">
        <Section title={t('addressTitle')} subtitle={t('addressSubtitle')}>
          {addresses.length === 0 ? (
            <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-6">
              <p className="text-bone/70">{t('noAddresses')}</p>
              <Link
                href="/account/addresses/new"
                className="mt-4 inline-block text-sm uppercase tracking-widest text-gold hover:underline"
              >
                {t('addAddress')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex cursor-pointer gap-3 rounded-sm border border-bone/10 bg-ash/40 p-4 transition hover:border-bone/30 has-[:checked]:border-gold/60"
                >
                  <input
                    type="radio"
                    name="addressId"
                    value={address.id}
                    defaultChecked={address.id === defaultAddress?.id}
                    required
                    className="mt-1 accent-gold"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-display text-base">{address.fullName}</p>
                    <p className="text-bone/60">{address.phone}</p>
                    <p className="mt-1 text-bone/80">
                      {address.street}, {address.city}, {address.postalCode}
                    </p>
                    <p className="text-bone/60">
                      {address.region}, {address.country}
                    </p>
                  </div>
                </label>
              ))}
              <Link
                href="/account/addresses/new"
                className="self-start text-xs uppercase tracking-widest text-bone/60 transition hover:text-gold"
              >
                + {t('addAddress')}
              </Link>
            </div>
          )}
        </Section>

        <Section title={t('shippingTitle')}>
          <div className="flex flex-col gap-3">
            {SHIPPING_METHODS.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-bone/10 bg-ash/40 px-4 py-3 transition hover:border-bone/30 has-[:checked]:border-gold/60"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method}
                    checked={shippingMethod === method}
                    onChange={() => setShippingMethod(method)}
                    required
                    className="accent-gold"
                  />
                  <span className="text-sm">{t(`shippingMethod.${method}`)}</span>
                </span>
                <span className="font-display text-sm">
                  {shippingCostUah(method) === 0
                    ? t('free')
                    : formatUah(shippingCostUah(method), locale)}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title={t('paymentTitle')}>
          <div className="flex flex-col gap-3">
            {PAYMENT_METHODS.map((method, idx) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-3 rounded-sm border border-bone/10 bg-ash/40 px-4 py-3 transition hover:border-bone/30 has-[:checked]:border-gold/60"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  defaultChecked={idx === 0}
                  required
                  className="accent-gold"
                />
                <span className="text-sm">{t(`paymentMethod.${method}`)}</span>
              </label>
            ))}
          </div>
        </Section>
      </div>

      <aside className="rounded-sm border border-bone/10 bg-ash/40 p-6 lg:sticky lg:top-24 lg:h-fit">
        <h2 className="font-display text-xl font-black uppercase tracking-tight">
          {t('summary')}
        </h2>

        <ul className="mt-4 flex flex-col gap-3 border-t border-bone/10 pt-4">
          {cart.items.map((item) => {
            const name = locale === 'en' ? item.product.nameEn : item.product.name;
            return (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="flex-1">
                  {name} × {item.quantity}
                </span>
                <span className="font-display">
                  {formatUah(item.product.priceUah * item.quantity, locale)}
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="mt-4 flex flex-col gap-2 border-t border-bone/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-bone/60">{t('subtotal')}</dt>
            <dd>{formatUah(subtotalUah, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bone/60">{t('shipping')}</dt>
            <dd>{shippingUah === 0 ? t('free') : formatUah(shippingUah, locale)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-bone/10 pt-4">
          <span className="text-xs uppercase tracking-widest text-bone/60">{t('total')}</span>
          <span className="font-display text-2xl">{formatUah(totalUah, locale)}</span>
        </div>

        {state?.error && (
          <p className="mt-4 text-sm text-red-400">
            {t(`errors.${state.error}`)}
            {state.outOfStockSlug && state.error === 'out_of_stock' && (
              <Link
                href={`/products/${state.outOfStockSlug}`}
                className="ml-2 underline hover:text-gold"
              >
                {t('viewProduct')}
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || addresses.length === 0}
          className="mt-6 w-full rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-40"
        >
          {pending ? t('placing') : t('placeOrder')}
        </button>
      </aside>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-black uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-bone/60">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
