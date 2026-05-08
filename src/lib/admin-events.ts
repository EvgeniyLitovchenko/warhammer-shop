export type OrderCreatedEvent = {
  type: 'order.created';
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  totalUah: number;
  itemsCount: number;
  createdAt: string;
};

export type AdminEvent = OrderCreatedEvent;

export const ADMIN_EVENT_NAMES = ['order.created'] as const;
