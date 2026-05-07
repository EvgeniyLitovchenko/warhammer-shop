'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAction, type AuthActionState } from '@/server/actions/auth';
import { Link } from '@/i18n/routing';

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState<AuthActionState | undefined, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

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
          autoComplete="current-password"
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
        {pending ? t('signingIn') : t('signIn')}
      </button>

      <p className="text-center text-sm text-bone/60">
        {t('noAccount')}{' '}
        <Link href="/auth/register" className="text-gold hover:underline">
          {t('createAccount')}
        </Link>
      </p>
    </form>
  );
}
