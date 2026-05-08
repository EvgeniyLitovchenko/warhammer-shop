import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user) redirect('/auth/login');
  if (role !== 'ADMIN' && role !== 'MANAGER') redirect('/');

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <AdminNav />
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
