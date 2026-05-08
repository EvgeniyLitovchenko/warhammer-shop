import type { Metadata } from 'next';
import type { OrderStatus } from '@prisma/client';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrderStatusFilter } from '@/components/admin/order-status-filter';
import { OrderTable } from '@/components/admin/order-table';
import { type Locale } from '@/i18n/routing';
import { ORDER_STATUSES } from '@/lib/validation/admin-order';
import { listAllOrders } from '@/server/queries/admin-orders';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.orders' });
  return { title: t('title') };
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const status = (ORDER_STATUSES as readonly string[]).includes(sp.status ?? '')
    ? (sp.status as OrderStatus)
    : null;

  const orders = await listAllOrders(status);
  const t = await getTranslations('admin.orders');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">{t('count', { n: orders.length })}</p>
      </header>

      <OrderStatusFilter value={status} />

      {orders.length === 0 ? (
        <div className="rounded-sm border border-dashed border-bone/20 bg-ash/20 p-12 text-center">
          <p className="text-bone/60">{t('empty')}</p>
        </div>
      ) : (
        <OrderTable orders={orders} locale={locale as Locale} />
      )}
    </div>
  );
}
