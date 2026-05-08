import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const display = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700', '900'],
  display: 'swap',
  preload: true,
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#1a1c1f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const description = t('subtitle');

  return {
    metadataBase: new URL(APP_URL),
    title: { default: 'Warhammer Shop', template: '%s — Warhammer Shop' },
    description,
    alternates: {
      canonical: locale === 'uk' ? '/' : `/${locale}`,
      languages: {
        uk: '/',
        en: '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Warhammer Shop',
      title: 'Warhammer Shop',
      description,
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
      url: APP_URL,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Warhammer Shop',
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body className="bg-ash text-bone font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-blood focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:uppercase focus:tracking-widest focus:text-bone"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div id="main-content">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
