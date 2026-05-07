import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user) redirect('/auth/login');
  if (role !== 'ADMIN' && role !== 'MANAGER') redirect('/');

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-16">{children}</main>
  );
}
