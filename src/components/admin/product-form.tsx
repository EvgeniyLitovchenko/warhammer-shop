'use client';

import type { Faction, Category } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { Link } from '@/i18n/routing';
import {
  saveProductAction,
  type ProductFormState,
} from '@/server/actions/admin-products';
import type { AdminProductDetail } from '@/server/queries/admin-products';

type CategoryWithChildren = Category & { children: Category[] };

export function ProductForm({
  product,
  factions,
  categories,
}: {
  product?: AdminProductDetail;
  factions: Faction[];
  categories: CategoryWithChildren[];
}) {
  const t = useTranslations('admin.products');
  const [state, action, pending] = useActionState<ProductFormState | undefined, FormData>(
    saveProductAction,
    undefined,
  );

  const fieldError = (key: string) => state?.fieldErrors?.[key as never]?.[0];
  const value = (key: string, fallback: string | number | null | undefined = ''): string => {
    if (state?.values?.[key] !== undefined) return state.values[key];
    if (fallback === null || fallback === undefined) return '';
    return String(fallback);
  };

  const priceDefault = product ? (product.priceUah / 100).toString() : '';
  const compareDefault = product?.comparePriceUah
    ? (product.comparePriceUah / 100).toString()
    : '';
  const stockDefault = product?.inventory?.stock?.toString() ?? '0';
  const imagesDefault = product?.images.map((i) => i.url).join('\n') ?? '';

  return (
    <form action={action} className="flex flex-col gap-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title={t('sectionBasic')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('slug')} error={fieldError('slug')}>
            <input
              name="slug"
              required
              defaultValue={value('slug', product?.slug)}
              className="admin-input"
            />
          </Field>
          <Field label={t('sku')} error={fieldError('sku')}>
            <input
              name="sku"
              required
              defaultValue={value('sku', product?.sku)}
              className="admin-input"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('name')} error={fieldError('name')}>
            <input
              name="name"
              required
              defaultValue={value('name', product?.name)}
              className="admin-input"
            />
          </Field>
          <Field label={t('nameEn')} error={fieldError('nameEn')}>
            <input
              name="nameEn"
              required
              defaultValue={value('nameEn', product?.nameEn)}
              className="admin-input"
            />
          </Field>
        </div>

        <Field label={t('description')} error={fieldError('description')}>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={value('description', product?.description)}
            className="admin-input"
          />
        </Field>

        <Field label={t('descriptionEn')} error={fieldError('descriptionEn')}>
          <textarea
            name="descriptionEn"
            required
            rows={4}
            defaultValue={value('descriptionEn', product?.descriptionEn)}
            className="admin-input"
          />
        </Field>
      </Section>

      <Section title={t('sectionPricing')}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t('price')} error={fieldError('priceUah')} hint={t('priceHint')}>
            <input
              name="priceUah"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={value('priceUah', priceDefault)}
              className="admin-input"
            />
          </Field>
          <Field
            label={t('comparePrice')}
            error={fieldError('comparePriceUah')}
            hint={t('comparePriceHint')}
          >
            <input
              name="comparePriceUah"
              type="number"
              min={0}
              step={1}
              defaultValue={value('comparePriceUah', compareDefault)}
              className="admin-input"
            />
          </Field>
          <Field label={t('stock')} error={fieldError('stock')}>
            <input
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={value('stock', stockDefault)}
              className="admin-input"
            />
          </Field>
        </div>
      </Section>

      <Section title={t('sectionTaxonomy')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('category')} error={fieldError('categoryId')}>
            <select
              name="categoryId"
              required
              defaultValue={value('categoryId', product?.categoryId)}
              className="admin-input"
            >
              <option value="">—</option>
              {categories.map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {parent.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label={t('faction')} error={fieldError('factionId')}>
            <select
              name="factionId"
              defaultValue={value('factionId', product?.factionId)}
              className="admin-input"
            >
              <option value="">—</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t('sectionImages')}>
        <Field label={t('imageUrls')} error={fieldError('imagesText')} hint={t('imageHint')}>
          <textarea
            name="imagesText"
            rows={6}
            defaultValue={value('imagesText', imagesDefault)}
            placeholder="https://example.com/image1.jpg"
            className="admin-input font-mono text-xs"
          />
        </Field>
      </Section>

      <Section title={t('sectionStatus')}>
        <Field label={t('statusCol')} error={fieldError('status')}>
          <select
            name="status"
            required
            defaultValue={value('status', product?.status ?? 'DRAFT')}
            className="admin-input"
          >
            <option value="DRAFT">{t('status.DRAFT')}</option>
            <option value="ACTIVE">{t('status.ACTIVE')}</option>
            <option value="ARCHIVED">{t('status.ARCHIVED')}</option>
          </select>
        </Field>
      </Section>

      {state?.error && state.error !== 'invalid_input' && (
        <p className="text-sm text-red-400">{t(`errors.${state.error}`)}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-60"
        >
          {pending ? t('saving') : t('save')}
        </button>
        <Link
          href="/admin/products"
          className="text-sm uppercase tracking-widest text-bone/60 transition hover:text-bone"
        >
          {t('cancel')}
        </Link>
      </div>

      <style>{`
        .admin-input {
          width: 100%;
          border: 1px solid rgb(231 223 198 / 0.2);
          background: rgb(26 28 31 / 0.4);
          border-radius: 2px;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus {
          border-color: rgb(201 165 88 / 0.6);
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-bone/10 pb-3 font-display text-sm uppercase tracking-widest text-bone/70">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="uppercase tracking-wider text-bone/70">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-bone/40">{hint}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
