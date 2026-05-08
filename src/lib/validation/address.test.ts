import { describe, it, expect } from 'vitest';
import { addressSchema } from './address';

const valid = {
  fullName: 'Сергій Кадія',
  phone: '+380 50 123 45 67',
  country: 'ua',
  region: 'Київська область',
  city: 'Київ',
  postalCode: '01001',
  street: 'вул. Хрещатик 1',
  isDefault: false,
};

describe('addressSchema', () => {
  it('accepts a valid address', () => {
    const r = addressSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.country).toBe('UA');
  });

  it('uppercases the country code', () => {
    const r = addressSchema.safeParse({ ...valid, country: 'pl' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.country).toBe('PL');
  });

  it('defaults country to UA when missing', () => {
    const { country: _country, ...rest } = valid;
    const r = addressSchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.country).toBe('UA');
  });

  it('defaults isDefault to false when missing', () => {
    const { isDefault: _isDefault, ...rest } = valid;
    const r = addressSchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isDefault).toBe(false);
  });

  it('rejects too-short fullName', () => {
    expect(addressSchema.safeParse({ ...valid, fullName: 'X' }).success).toBe(false);
  });

  it('rejects malformed phone', () => {
    const r = addressSchema.safeParse({ ...valid, phone: 'pls call me!' });
    expect(r.success).toBe(false);
  });

  it('accepts plain digits in phone', () => {
    expect(addressSchema.safeParse({ ...valid, phone: '0501234567' }).success).toBe(true);
  });

  it('rejects wrong country code length', () => {
    expect(addressSchema.safeParse({ ...valid, country: 'UKR' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, country: 'U' }).success).toBe(false);
  });

  it('trims surrounding whitespace', () => {
    const r = addressSchema.safeParse({ ...valid, city: '  Львів  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.city).toBe('Львів');
  });
});
