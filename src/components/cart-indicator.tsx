import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCartView } from '@/server/queries/cart';

export async function CartIndicator() {
  const { totals } = await getCartView();
  const t = await getTranslations('nav');
  const count = totals.totalQty;

  return (
    <Link
      href="/cart"
      aria-label={`${t('cart')} (${count})`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-bone/20 transition hover:border-gold/60"
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
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blood px-1 font-display text-[10px] font-bold text-bone">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
