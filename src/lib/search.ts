export const MAX_QUERY_LENGTH = 100;
export const MIN_QUERY_LENGTH = 2;

export function normalizeQuery(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
}

export function isQueryValid(query: string): boolean {
  return query.length >= MIN_QUERY_LENGTH;
}

export function highlight(text: string, query: string): Array<{ part: string; match: boolean }> {
  if (!query) return [{ part: text, match: false }];
  const tokens = query
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (tokens.length === 0) return [{ part: text, match: false }];

  const re = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((part) => ({ part, match: re.test(part) && part.length > 0 }));
}
