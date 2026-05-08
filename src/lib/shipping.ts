import type { ShippingMethod } from '@prisma/client';

export const SHIPPING_RATES_UAH: Record<ShippingMethod, number> = {
  NOVA_POSHTA: 8000,
  PICKUP: 0,
};

export function shippingCostUah(method: ShippingMethod): number {
  return SHIPPING_RATES_UAH[method];
}
