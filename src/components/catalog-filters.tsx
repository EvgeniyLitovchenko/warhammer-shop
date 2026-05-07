import type { Locale } from '@/i18n/routing';
import type { CatalogFilterState } from '@/lib/filters';
import { listFactions, listTopCategories } from '@/server/queries/taxonomy';
import { CatalogFiltersForm } from './catalog-filters-form';

export async function CatalogFilters({
  current,
  locale,
}: {
  current: CatalogFilterState;
  locale: Locale;
}) {
  const [factions, categories] = await Promise.all([
    listFactions(current.system),
    listTopCategories(),
  ]);

  const factionOptions = factions.map((f) => ({
    slug: f.slug,
    name: locale === 'en' ? f.nameEn : f.name,
  }));

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    name: locale === 'en' ? c.nameEn : c.name,
  }));

  return (
    <CatalogFiltersForm
      current={current}
      factions={factionOptions}
      categories={categoryOptions}
    />
  );
}
