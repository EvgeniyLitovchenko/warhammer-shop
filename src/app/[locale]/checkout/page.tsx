import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CheckoutForm } from '@/components/checkout-form';
import { type Locale } from '@/i18n/routing';
import { isStripeConfigured } from '@/lib/stripe';
import { listUserAddresses } from '@/server/queries/addresses';
import { getCartView } from '@/server/queries/cart';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('title') };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/auth/login?callbackUrl=/checkout');

  const { cart } = await getCartView();
  if (!cart || cart.items.length === 0) redirect('/cart');

  const addresses = await listUserAddresses(session.user.id);
  const t = await getTranslations('checkout');
  const lang = locale as Locale;

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <header className="border-b border-bone/10 pb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/80">{t('eyebrow')}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          {t('title')}
        </h1>
      </header>

      <div className="mt-10">
        <CheckoutForm
          cart={cart}
          addresses={addresses}
          locale={lang}
          stripeEnabled={isStripeConfigured()}
        />
      </div>
    </main>
  );
}
