import { type Delta, periodDelta } from '@/lib/dashboard-stats';

export function KpiCard({
  label,
  value,
  hint,
  current,
  previous,
}: {
  label: string;
  value: string;
  hint?: string;
  current?: number;
  previous?: number;
}) {
  const delta: Delta | null =
    current !== undefined && previous !== undefined ? periodDelta(current, previous) : null;

  const tone =
    delta?.direction === 'up'
      ? 'text-emerald-400'
      : delta?.direction === 'down'
        ? 'text-red-400'
        : 'text-bone/60';
  const arrow =
    delta?.direction === 'up' ? '▲' : delta?.direction === 'down' ? '▼' : '·';

  return (
    <article className="rounded-sm border border-bone/10 bg-ash/40 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-bone/50">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-bone/50">{hint}</p>}
      {delta && (
        <p className={`mt-3 text-xs uppercase tracking-widest ${tone}`}>
          {arrow} {Math.abs(delta.pct)}%
        </p>
      )}
    </article>
  );
}
