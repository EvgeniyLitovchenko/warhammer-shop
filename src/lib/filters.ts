import type { GameSystem } from '@prisma/client';
import type { SortKey } from './pagination';

export type CatalogFilterState = {
  system: GameSystem | null;
  factions: string[];
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
};

export const ALLOWED_SYSTEMS: GameSystem[] = ['WARHAMMER_40K', 'AGE_OF_SIGMAR'];

export const EMPTY_FILTERS: CatalogFilterState = {
  system: null,
  factions: [],
  category: null,
  priceMin: null,
  priceMax: null,
  inStock: false,
};

type SearchParamSource = Record<string, string | string[] | undefined>;

const firstString = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const parsePositiveInt = (value: string | undefined): number | null => {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

const parseSystem = (value: string | undefined): GameSystem | null =>
  value && (ALLOWED_SYSTEMS as string[]).includes(value) ? (value as GameSystem) : null;

const parseFactionList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]+$/.test(s));
};

const parseSlug = (value: string | undefined): string | null => {
  if (!value) return null;
  return /^[a-z0-9-]+$/.test(value) ? value : null;
};

export function parseFilters(searchParams: SearchParamSource): CatalogFilterState {
  return {
    system: parseSystem(firstString(searchParams.system)),
    factions: parseFactionList(firstString(searchParams.faction)),
    category: parseSlug(firstString(searchParams.category)),
    priceMin: parsePositiveInt(firstString(searchParams.priceMin)),
    priceMax: parsePositiveInt(firstString(searchParams.priceMax)),
    inStock: firstString(searchParams.inStock) === '1',
  };
}

export function isFiltersEmpty(filters: CatalogFilterState): boolean {
  return (
    filters.system === null &&
    filters.factions.length === 0 &&
    filters.category === null &&
    filters.priceMin === null &&
    filters.priceMax === null &&
    !filters.inStock
  );
}

export function buildCatalogUrl({
  filters,
  sort,
  page = 1,
}: {
  filters: CatalogFilterState;
  sort?: SortKey;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (filters.system) params.set('system', filters.system);
  if (filters.factions.length) params.set('faction', filters.factions.join(','));
  if (filters.category) params.set('category', filters.category);
  if (filters.priceMin !== null) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax !== null) params.set('priceMax', String(filters.priceMax));
  if (filters.inStock) params.set('inStock', '1');
  if (sort && sort !== 'newest') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : '/catalog';
}
