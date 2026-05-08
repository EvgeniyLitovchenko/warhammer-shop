import { describe, it, expect } from 'vitest';
import { shippingCostUah, SHIPPING_RATES_UAH } from './shipping';

describe('shippingCostUah', () => {
  it('charges 80 UAH for Nova Poshta', () => {
    expect(shippingCostUah('NOVA_POSHTA')).toBe(8000);
  });

  it('charges nothing for pickup', () => {
    expect(shippingCostUah('PICKUP')).toBe(0);
  });

  it('matches the rate table', () => {
    expect(SHIPPING_RATES_UAH.NOVA_POSHTA).toBe(8000);
    expect(SHIPPING_RATES_UAH.PICKUP).toBe(0);
  });
});
