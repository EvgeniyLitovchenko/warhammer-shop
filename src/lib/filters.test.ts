import { describe, it, expect } from 'vitest';
import { buildCatalogUrl, EMPTY_FILTERS, isFiltersEmpty, parseFilters } from './filters';

describe('parseFilters', () => {
  it('returns all empty defaults', () => {
    expect(parseFilters({})).toEqual(EMPTY_FILTERS);
  });

  it('parses a known game system', () => {
    expect(parseFilters({ system: 'WARHAMMER_40K' }).system).toBe('WARHAMMER_40K');
  });

  it('rejects unknown system', () => {
    expect(parseFilters({ system: 'STAR_WARS' }).system).toBeNull();
  });

  it('parses comma-separated faction slugs', () => {
    expect(parseFilters({ faction: 'space-marines,tyranids' }).factions).toEqual([
      'space-marines',
      'tyranids',
    ]);
  });

  it('drops malformed faction slugs', () => {
    expect(parseFilters({ faction: 'good, BAD!, also-good' }).factions).toEqual([
      'good',
      'also-good',
    ]);
  });

  it('parses positive integer prices', () => {
    const f = parseFilters({ priceMin: '1500', priceMax: '6000' });
    expect(f.priceMin).toBe(1500);
    expect(f.priceMax).toBe(6000);
  });

  it('rejects negative or non-numeric prices', () => {
    const f = parseFilters({ priceMin: '-5', priceMax: 'abc' });
    expect(f.priceMin).toBeNull();
    expect(f.priceMax).toBeNull();
  });

  it('parses inStock=1 as true', () => {
    expect(parseFilters({ inStock: '1' }).inStock).toBe(true);
    expect(parseFilters({ inStock: '0' }).inStock).toBe(false);
    expect(parseFilters({ inStock: 'yes' }).inStock).toBe(false);
  });

  it('takes first value for array params', () => {
    expect(parseFilters({ system: ['WARHAMMER_40K', 'AGE_OF_SIGMAR'] }).system).toBe(
      'WARHAMMER_40K',
    );
  });
});

describe('isFiltersEmpty', () => {
  it('true for the empty state', () => {
    expect(isFiltersEmpty(EMPTY_FILTERS)).toBe(true);
  });

  it('false when any filter is set', () => {
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, system: 'WARHAMMER_40K' })).toBe(false);
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, factions: ['x'] })).toBe(false);
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, inStock: true })).toBe(false);
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, priceMin: 100 })).toBe(false);
  });
});

describe('buildCatalogUrl', () => {
  it('returns plain catalog url when nothing is set', () => {
    expect(buildCatalogUrl({ filters: EMPTY_FILTERS })).toBe('/catalog');
  });

  it('serialises factions as comma list', () => {
    const url = buildCatalogUrl({
      filters: { ...EMPTY_FILTERS, factions: ['space-marines', 'tyranids'] },
    });
    expect(url).toContain('faction=space-marines%2Ctyranids');
  });

  it('omits sort when newest', () => {
    const url = buildCatalogUrl({ filters: EMPTY_FILTERS, sort: 'newest' });
    expect(url).toBe('/catalog');
  });

  it('includes sort when non-default', () => {
    const url = buildCatalogUrl({ filters: EMPTY_FILTERS, sort: 'price_asc' });
    expect(url).toContain('sort=price_asc');
  });

  it('omits page when 1', () => {
    expect(buildCatalogUrl({ filters: EMPTY_FILTERS, page: 1 })).toBe('/catalog');
    expect(buildCatalogUrl({ filters: EMPTY_FILTERS, page: 3 })).toContain('page=3');
  });

  it('round-trips through parseFilters', () => {
    const filters = {
      system: 'WARHAMMER_40K' as const,
      factions: ['space-marines'],
      category: 'miniatures',
      priceMin: 1000,
      priceMax: 6000,
      inStock: true,
    };
    const url = buildCatalogUrl({ filters });
    const qs = url.replace('/catalog?', '');
    const parsed = parseFilters(Object.fromEntries(new URLSearchParams(qs).entries()));
    expect(parsed).toEqual(filters);
  });
});
