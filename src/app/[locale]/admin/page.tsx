import { getTranslations, setRequestLocale } from 'next-intl/server';
import { KpiCard } from '@/components/admin/kpi-card';
import { LowStockCard } from '@/components/admin/low-stock-card';
import { RecentOrdersCard } from '@/components/admin/recent-orders-card';
import { TopProductsCard } from '@/components/admin/top-products-card';
import { type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import { getDashboardSnapshot } from '@/server/queries/dashboard';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.dashboard');
  const lang = locale as Locale;

  const snapshot = await getDashboardSnapshot();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-bone/60">
          {t('periodSubtitle', { days: snapshot.periodDays })}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('revenue')}
          value={formatUah(snapshot.current.revenue, lang)}
          current={snapshot.current.revenue}
          previous={snapshot.previous.revenue}
        />
        <KpiCard
          label={t('orders')}
          value={String(snapshot.current.orders)}
          hint={t('pendingHint', { n: snapshot.pendingOrders })}
          current={snapshot.current.orders}
          previous={snapshot.previous.orders}
        />
        <KpiCard
          label={t('newCustomers')}
          value={String(snapshot.current.newCustomers)}
          current={snapshot.current.newCustomers}
          previous={snapshot.previous.newCustomers}
        />
        <KpiCard
          label={t('avgOrder')}
          value={formatUah(snapshot.current.avgOrder, lang)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsCard products={snapshot.topProducts} locale={lang} />
        <RecentOrdersCard orders={snapshot.recentOrders} locale={lang} />
      </div>

      <LowStockCard products={snapshot.lowStock} locale={lang} />
    </div>
  );
}
