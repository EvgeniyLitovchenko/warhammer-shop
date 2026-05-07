import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases ascii', () => {
    expect(slugify('Space Marines')).toBe('space-marines');
  });

  it('transliterates ukrainian', () => {
    expect(slugify('Ультрамарини')).toBe('ultramaryny');
  });

  it('strips punctuation', () => {
    expect(slugify('Warhammer 40,000: Codex!')).toBe('warhammer-40-000-codex');
  });

  it('collapses repeating separators', () => {
    expect(slugify('  hello   world  ')).toBe('hello-world');
  });

  it('returns empty string for non-alphanumeric input', () => {
    expect(slugify('---')).toBe('');
  });
});
