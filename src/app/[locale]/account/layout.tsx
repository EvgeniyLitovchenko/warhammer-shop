import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AccountNav } from '@/components/account-nav';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountNav />
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
