export const PAGE_SIZE = 12;

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export const SORT_KEYS: SortKey[] = ['newest', 'price_asc', 'price_desc', 'name_asc'];

export function parsePage(value: string | undefined): number {
  if (!value) return 1;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function parseSort(value: string | undefined): SortKey {
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : 'newest';
}

export function totalPages(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageRange(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}
