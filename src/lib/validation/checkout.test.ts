import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './checkout';

const valid = {
  addressId: 'cklxxxxxxxxxxx0001',
  shippingMethod: 'NOVA_POSHTA' as const,
  paymentMethod: 'CASH_ON_DELIVERY' as const,
};

describe('checkoutSchema', () => {
  it('accepts a valid input', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty addressId', () => {
    expect(checkoutSchema.safeParse({ ...valid, addressId: '' }).success).toBe(false);
  });

  it('rejects unknown shipping method', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, shippingMethod: 'TELEPORT' as never }).success,
    ).toBe(false);
  });

  it('rejects unknown payment method', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, paymentMethod: 'CRYPTO' as never }).success,
    ).toBe(false);
  });

  it('accepts pickup + card on delivery combination', () => {
    expect(
      checkoutSchema.safeParse({
        ...valid,
        shippingMethod: 'PICKUP',
        paymentMethod: 'CARD_ON_DELIVERY',
      }).success,
    ).toBe(true);
  });
});
