import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';

const display = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700', '900'],
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    default: 'Warhammer Shop',
    template: '%s — Warhammer Shop',
  },
  description: 'Мініатюри, фарби, книги та аксесуари Warhammer',
};

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

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body className="bg-ash text-bone font-body antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
