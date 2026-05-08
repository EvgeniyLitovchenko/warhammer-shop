import { randomBytes } from 'node:crypto';

export function generateOrderNumber(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = randomBytes(2).toString('hex').toUpperCase();
  return `WH-${yy}${mm}${dd}-${random}`;
}

const ORDER_NUMBER_RE = /^WH-\d{6}-[0-9A-F]{4}$/;

export function isOrderNumber(value: string): boolean {
  return ORDER_NUMBER_RE.test(value);
}
