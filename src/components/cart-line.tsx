'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import {
  removeFromCartAction,
  setQuantityAction,
} from '@/server/actions/cart';
import type { CartWithItems } from '@/server/queries/cart';

type CartItem = CartWithItems['items'][number];

export function CartLine({ item, locale }: { item: CartItem; locale: Locale }) {
  const t = useTranslations('cart');
  const [pending, startTransition] = useTransition();

  const product = item.product;
  const name = locale === 'en' ? product.nameEn : product.name;
  const image = product.images[0];
  const stock = product.inventory?.stock ?? 0;
  const lineTotal = item.quantity * product.priceUah;

  const update = (next: number) => {
    startTransition(async () => {
      await setQuantityAction({ productId: product.id, quantity: next });
    });
  };

  const remove = () => {
    startTransition(async () => {
      await removeFromCartAction({ productId: product.id });
    });
  };

  return (
    <li
      className={`grid grid-cols-[80px_1fr] gap-4 border-b border-bone/10 py-6 sm:grid-cols-[100px_1fr_auto] sm:items-center ${
        pending ? 'opacity-60' : ''
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-sm border border-bone/10 bg-ash/40"
      >
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? name}
            fill
            sizes="100px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-col gap-2">
        <Link href={`/products/${product.slug}`} className="font-display text-lg hover:text-gold">
          {name}
        </Link>
        <p className="text-sm text-bone/60">
          {formatUah(product.priceUah, locale)} · {t('inStock', { n: stock })}
        </p>

        <div className="mt-1 inline-flex items-center gap-3 sm:hidden">
          <QuantityStepper
            value={item.quantity}
            stock={stock}
            pending={pending}
            onUpdate={update}
          />
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-xs uppercase tracking-widest text-bone/50 transition hover:text-red-400"
          >
            {t('remove')}
          </button>
        </div>
      </div>

      <div className="hidden items-center gap-6 sm:flex">
        <QuantityStepper
          value={item.quantity}
          stock={stock}
          pending={pending}
          onUpdate={update}
        />
        <span className="font-display text-lg w-32 text-right">
          {formatUah(lineTotal, locale)}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={t('remove')}
          className="text-bone/50 transition hover:text-red-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 6h18" />
            <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
          </svg>
        </button>
      </div>
    </li>
  );
}

function QuantityStepper({
  value,
  stock,
  pending,
  onUpdate,
}: {
  value: number;
  stock: number;
  pending: boolean;
  onUpdate: (next: number) => void;
}) {
  const canInc = value < stock && value < 99;
  const canDec = value > 1;

  return (
    <div className="inline-flex items-center rounded-sm border border-bone/20">
      <button
        type="button"
        disabled={pending || !canDec}
        onClick={() => onUpdate(value - 1)}
        aria-label="−"
        className="h-9 w-9 text-lg transition hover:text-gold disabled:opacity-30"
      >
        −
      </button>
      <span className="w-10 text-center font-display text-base">{value}</span>
      <button
        type="button"
        disabled={pending || !canInc}
        onClick={() => onUpdate(value + 1)}
        aria-label="+"
        className="h-9 w-9 text-lg transition hover:text-gold disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
