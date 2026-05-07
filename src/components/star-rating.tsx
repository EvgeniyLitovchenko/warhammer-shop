import { clampStars } from '@/lib/reviews';

export function StarRating({
  value,
  size = 'sm',
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const filled = clampStars(value);
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-base';

  return (
    <span aria-label={`${value} of 5`} className={`inline-flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? 'text-gold' : 'text-bone/20'}>
          ★
        </span>
      ))}
    </span>
  );
}
