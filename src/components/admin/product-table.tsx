import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { formatUah } from '@/lib/money';
import type { AdminProductRow } from '@/server/queries/admin-products';
import { ProductStatusBadge } from './product-status-badge';
import { ProductStatusButton } from './product-status-button';

export async function ProductTable({
  products,
  locale,
}: {
  products: AdminProductRow[];
  locale: Locale;
}) {
  const t = await getTranslations('admin.products');

  return (
    <div className="overflow-x-auto rounded-sm border border-bone/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bone/10 bg-ash/40 text-left text-xs uppercase tracking-widest text-bone/60">
            <th className="p-3"></th>
            <th className="p-3">{t('name')}</th>
            <th className="p-3">{t('sku')}</th>
            <th className="p-3">{t('price')}</th>
            <th className="p-3">{t('stock')}</th>
            <th className="p-3">{t('orders')}</th>
            <th className="p-3">{t('statusCol')}</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const image = p.images[0];
            const name = locale === 'en' ? p.nameEn : p.name;
            return (
              <tr key={p.id} className="border-b border-bone/10 hover:bg-ash/30">
                <td className="p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-sm border border-bone/10 bg-ash">
                    {image && (
                      <Image src={image.url} alt={name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-display text-base hover:text-gold"
                  >
                    {name}
                  </Link>
                  <p className="text-xs text-bone/50">{p.category.name}</p>
                </td>
                <td className="p-3 font-mono text-xs">{p.sku}</td>
                <td className="p-3 font-display">{formatUah(p.priceUah, locale)}</td>
                <td className="p-3">{p.inventory?.stock ?? 0}</td>
                <td className="p-3 text-bone/70">{p._count.orderItems}</td>
                <td className="p-3">
                  <ProductStatusBadge status={p.status} />
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs uppercase tracking-widest text-bone/80 transition hover:text-gold"
                    >
                      {t('edit')}
                    </Link>
                    {p.status !== 'ACTIVE' && (
                      <ProductStatusButton productId={p.id} current={p.status} next="ACTIVE" />
                    )}
                    {p.status !== 'ARCHIVED' && (
                      <ProductStatusButton productId={p.id} current={p.status} next="ARCHIVED" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
