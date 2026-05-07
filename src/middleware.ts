import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth/config';
import { routing } from '@/i18n/routing';

const handleI18n = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

const localePrefix = `(?:/(?:${routing.locales.join('|')}))?`;
const protectedPattern = new RegExp(`^${localePrefix}/(account|admin)(?:/.*)?$`);
const adminPattern = new RegExp(`^${localePrefix}/admin(?:/.*)?$`);
const guestOnlyPattern = new RegExp(`^${localePrefix}/auth/(login|register)(?:/.*)?$`);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (protectedPattern.test(pathname) && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (adminPattern.test(pathname) && role !== 'ADMIN' && role !== 'MANAGER') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (guestOnlyPattern.test(pathname) && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return handleI18n(req);
});

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
