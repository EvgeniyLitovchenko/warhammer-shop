export type Delta = {
  abs: number;
  pct: number;
  direction: 'up' | 'down' | 'flat';
};

export function periodDelta(current: number, previous: number): Delta {
  const abs = current - previous;

  if (previous === 0) {
    if (current === 0) return { abs: 0, pct: 0, direction: 'flat' };
    return { abs, pct: 100, direction: 'up' };
  }

  const pct = Math.round((abs / previous) * 100);
  return {
    abs,
    pct,
    direction: abs > 0 ? 'up' : abs < 0 ? 'down' : 'flat',
  };
}

export function daysAgo(days: number, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
}
