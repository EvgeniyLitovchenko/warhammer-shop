'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { registerAction, type AuthActionState } from '@/server/actions/auth';
import { Link } from '@/i18n/routing';

export function RegisterForm() {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState<AuthActionState | undefined, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('name')}</span>
        <input
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className="rounded-sm border border-bone/20 bg-ash/40 px-4 py-3 outline-none transition focus:border-gold/60"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('email')}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-sm border border-bone/20 bg-ash/40 px-4 py-3 outline-none transition focus:border-gold/60"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('password')}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className="rounded-sm border border-bone/20 bg-ash/40 px-4 py-3 outline-none transition focus:border-gold/60"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('confirmPassword')}</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className="rounded-sm border border-bone/20 bg-ash/40 px-4 py-3 outline-none transition focus:border-gold/60"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400">{t(`errors.${state.error}`)}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-60"
      >
        {pending ? t('creating') : t('createAccount')}
      </button>

      <p className="text-center text-sm text-bone/60">
        {t('haveAccount')}{' '}
        <Link href="/auth/login" className="text-gold hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </form>
  );
}
