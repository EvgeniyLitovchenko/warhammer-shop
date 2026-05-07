export function averageRating(ratings: readonly number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return sum / ratings.length;
}

export function clampStars(value: number): number {
  if (value < 0) return 0;
  if (value > 5) return 5;
  return Math.round(value);
}
