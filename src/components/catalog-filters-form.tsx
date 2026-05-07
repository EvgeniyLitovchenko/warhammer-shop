'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { ALLOWED_SYSTEMS, type CatalogFilterState, isFiltersEmpty } from '@/lib/filters';

type Option = { slug: string; name: string };
type Updates = Record<string, string | string[] | null>;

export function CatalogFiltersForm({
  current,
  factions,
  categories,
}: {
  current: CatalogFilterState;
  factions: Option[];
  categories: Option[];
}) {
  const t = useTranslations('catalog.filters');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (updates: Updates) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length === 0) params.delete(key);
        else params.set(key, value.join(','));
      } else {
        params.set(key, value);
      }
    }
    params.delete('page');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const setSystem = (next: string | null) => {
    apply({ system: next, faction: null });
  };

  const toggleFaction = (slug: string) => {
    const next = current.factions.includes(slug)
      ? current.factions.filter((s) => s !== slug)
      : [...current.factions, slug];
    apply({ faction: next });
  };

  const setCategory = (slug: string | null) => apply({ category: slug });

  const setPrice = (key: 'priceMin' | 'priceMax', raw: string) => {
    const value = raw.trim();
    apply({ [key]: value === '' ? null : value });
  };

  const setInStock = (checked: boolean) => apply({ inStock: checked ? '1' : null });

  const reset = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const empty = isFiltersEmpty(current);
  const dim = pending ? 'opacity-60 transition' : 'transition';

  return (
    <aside className={`flex flex-col gap-8 ${dim}`} aria-busy={pending}>
      <Section title={t('system')}>
        <RadioRow
          label={t('any')}
          name="system"
          checked={current.system === null}
          onChange={() => setSystem(null)}
        />
        {ALLOWED_SYSTEMS.map((sys) => (
          <RadioRow
            key={sys}
            label={t(`systems.${sys}`)}
            name="system"
            checked={current.system === sys}
            onChange={() => setSystem(sys)}
          />
        ))}
      </Section>

      <Section title={t('faction')}>
        {factions.length === 0 ? (
          <p className="text-xs text-bone/40">{t('emptyFactions')}</p>
        ) : (
          factions.map((f) => (
            <CheckboxRow
              key={f.slug}
              label={f.name}
              checked={current.factions.includes(f.slug)}
              onChange={() => toggleFaction(f.slug)}
            />
          ))
        )}
      </Section>

      <Section title={t('category')}>
        <RadioRow
          label={t('any')}
          name="category"
          checked={current.category === null}
          onChange={() => setCategory(null)}
        />
        {categories.map((c) => (
          <RadioRow
            key={c.slug}
            label={c.name}
            name="category"
            checked={current.category === c.slug}
            onChange={() => setCategory(c.slug)}
          />
        ))}
      </Section>

      <Section title={t('price')}>
        <div className="flex items-center gap-2">
          <PriceInput
            placeholder={t('from')}
            defaultValue={current.priceMin ?? ''}
            onCommit={(v) => setPrice('priceMin', v)}
          />
          <span className="text-bone/40">—</span>
          <PriceInput
            placeholder={t('to')}
            defaultValue={current.priceMax ?? ''}
            onCommit={(v) => setPrice('priceMax', v)}
          />
        </div>
      </Section>

      <Section title={t('availability')}>
        <CheckboxRow
          label={t('inStock')}
          checked={current.inStock}
          onChange={(checked) => setInStock(checked)}
        />
      </Section>

      {!empty && (
        <button
          type="button"
          onClick={reset}
          className="self-start text-xs uppercase tracking-widest text-bone/60 underline-offset-4 transition hover:text-gold hover:underline"
        >
          {t('reset')}
        </button>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-bone/70">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-bone/80 hover:text-bone">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-gold" />
      {label}
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-bone/80 hover:text-bone">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-gold"
      />
      {label}
    </label>
  );
}

function PriceInput({
  placeholder,
  defaultValue,
  onCommit,
}: {
  placeholder: string;
  defaultValue: number | string;
  onCommit: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className="w-full rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none transition focus:border-gold/60"
    />
  );
}
