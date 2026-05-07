import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';

export async function Header() {
  const session = await auth();
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b border-bone/10 bg-ash/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-black uppercase tracking-widest">
          Warhammer Shop
        </Link>

        <nav className="hidden items-center gap-6 text-sm uppercase tracking-wider md:flex">
          <Link href="/catalog" className="hover:text-gold">
            {t('catalog')}
          </Link>
          <Link href="/factions" className="hover:text-gold">
            {t('factions')}
          </Link>
          <Link href="/about" className="hover:text-gold">
            {t('about')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}
