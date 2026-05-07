import type { Session } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { logoutAction } from '@/server/actions/auth';

export async function UserMenu({ session }: { session: Session | null }) {
  const t = await getTranslations('nav');

  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-sm border border-bone/20 px-4 py-2 text-xs uppercase tracking-widest transition hover:border-gold hover:text-gold"
      >
        {t('signIn')}
      </Link>
    );
  }

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MANAGER';

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/account" className="hover:text-gold">
        {session.user.name ?? session.user.email}
      </Link>
      {isStaff && (
        <Link
          href="/admin"
          className="rounded-sm border border-gold/40 px-2 py-1 text-xs uppercase tracking-widest text-gold"
        >
          Admin
        </Link>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-xs uppercase tracking-widest text-bone/60 transition hover:text-bone"
        >
          {t('signOut')}
        </button>
      </form>
    </div>
  );
}
