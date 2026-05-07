export function formatUah(kopecks: number, locale: 'uk' | 'en' = 'uk'): string {
  const value = kopecks / 100;
  return new Intl.NumberFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(value);
}

export function toKopecks(uah: number): number {
  return Math.round(uah * 100);
}
