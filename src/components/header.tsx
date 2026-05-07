import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { SearchBar } from './search-bar';
import { UserMenu } from './user-menu';

export async function Header() {
  const session = await auth();
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b border-bone/10 bg-ash/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="font-display text-xl font-black uppercase tracking-widest">
          Warhammer Shop
        </Link>

        <nav className="hidden items-center gap-6 text-sm uppercase tracking-wider lg:flex">
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

        <SearchBar className="ml-auto hidden w-72 sm:block" />

        <div className="ml-auto flex items-center gap-4 sm:ml-0">
          <LocaleSwitcher />
          <UserMenu session={session} />
        </div>
      </div>

      <div className="border-t border-bone/10 px-6 py-2 sm:hidden">
        <SearchBar className="w-full" />
      </div>
    </header>
  );
}
