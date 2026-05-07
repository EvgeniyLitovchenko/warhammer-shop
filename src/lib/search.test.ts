import { describe, it, expect } from 'vitest';
import { highlight, isQueryValid, MAX_QUERY_LENGTH, normalizeQuery } from './search';

describe('normalizeQuery', () => {
  it('returns empty for null/undefined/empty', () => {
    expect(normalizeQuery(null)).toBe('');
    expect(normalizeQuery(undefined)).toBe('');
    expect(normalizeQuery('')).toBe('');
    expect(normalizeQuery('   ')).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeQuery('  hello  ')).toBe('hello');
  });

  it('collapses inner whitespace', () => {
    expect(normalizeQuery('space  marines')).toBe('space marines');
    expect(normalizeQuery('a\t\tb\nc')).toBe('a b c');
  });

  it('caps to max length', () => {
    const long = 'a'.repeat(MAX_QUERY_LENGTH + 50);
    expect(normalizeQuery(long).length).toBe(MAX_QUERY_LENGTH);
  });
});

describe('isQueryValid', () => {
  it('false for empty and one char', () => {
    expect(isQueryValid('')).toBe(false);
    expect(isQueryValid('a')).toBe(false);
  });

  it('true at min length and beyond', () => {
    expect(isQueryValid('ab')).toBe(true);
    expect(isQueryValid('hello world')).toBe(true);
  });
});

describe('highlight', () => {
  it('returns the whole string as no-match for empty query', () => {
    expect(highlight('Space Marines', '')).toEqual([{ part: 'Space Marines', match: false }]);
  });

  it('marks single-token matches', () => {
    const parts = highlight('Space Marines Combat Patrol', 'marines');
    const matched = parts.filter((p) => p.match);
    expect(matched).toHaveLength(1);
    expect(matched[0]?.part.toLowerCase()).toBe('marines');
  });

  it('matches multiple tokens case-insensitively', () => {
    const parts = highlight('Space Marines Combat Patrol', 'space patrol');
    const matched = parts.filter((p) => p.match).map((p) => p.part.toLowerCase());
    expect(matched).toContain('space');
    expect(matched).toContain('patrol');
  });

  it('escapes regex metacharacters in query', () => {
    expect(() => highlight('a (b) c', '(b)')).not.toThrow();
    const parts = highlight('a (b) c', '(b)');
    const matched = parts.filter((p) => p.match);
    expect(matched.some((m) => m.part === '(b)')).toBe(true);
  });
});
