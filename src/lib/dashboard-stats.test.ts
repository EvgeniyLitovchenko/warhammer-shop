import { describe, it, expect } from 'vitest';
import { daysAgo, periodDelta } from './dashboard-stats';

describe('periodDelta', () => {
  it('handles zero previous and zero current as flat', () => {
    expect(periodDelta(0, 0)).toEqual({ abs: 0, pct: 0, direction: 'flat' });
  });

  it('treats growth from zero as +100%', () => {
    expect(periodDelta(50, 0)).toEqual({ abs: 50, pct: 100, direction: 'up' });
  });

  it('computes up direction when growth', () => {
    const r = periodDelta(150, 100);
    expect(r.abs).toBe(50);
    expect(r.pct).toBe(50);
    expect(r.direction).toBe('up');
  });

  it('computes down direction when shrink', () => {
    const r = periodDelta(80, 100);
    expect(r.abs).toBe(-20);
    expect(r.pct).toBe(-20);
    expect(r.direction).toBe('down');
  });

  it('rounds percentage to integer', () => {
    expect(periodDelta(101, 99).pct).toBe(2);
    expect(periodDelta(99, 100).pct).toBe(-1);
  });

  it('returns flat when equal', () => {
    expect(periodDelta(100, 100)).toEqual({ abs: 0, pct: 0, direction: 'flat' });
  });
});

describe('daysAgo', () => {
  it('subtracts whole days from given anchor', () => {
    const anchor = new Date('2026-05-08T12:00:00Z');
    const r = daysAgo(7, anchor);
    expect(r.toISOString().slice(0, 10)).toBe('2026-05-01');
  });

  it('handles zero days as same day', () => {
    const anchor = new Date('2026-05-08T12:00:00Z');
    expect(daysAgo(0, anchor).getTime()).toBe(anchor.getTime());
  });
});
