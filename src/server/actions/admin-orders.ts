'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { orderStatusUpdateSchema } from '@/lib/validation/admin-order';

export type ChangeOrderStatusState = {
  ok?: true;
  error?: 'unauthorized' | 'invalid_input' | 'not_found' | 'unknown';
};

export async function changeOrderStatusAction(
  _prev: ChangeOrderStatusState | undefined,
  formData: FormData,
): Promise<ChangeOrderStatusState> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
  ) {
    return { error: 'unauthorized' };
  }

  const parsed = orderStatusUpdateSchema.safeParse({
    orderId: formData.get('orderId'),
    status: formData.get('status'),
    comment: formData.get('comment'),
  });
  if (!parsed.success) return { error: 'invalid_input' };

  const { orderId, status, comment } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });
  if (!existing) return { error: 'not_found' };

  if (existing.status === status && !comment) return { ok: true };

  try {
    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status } }),
      prisma.orderStatusHistory.create({
        data: { orderId, status, comment: comment ?? undefined },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'order.status_changed',
          entity: 'Order',
          entityId: orderId,
          payload: {
            from: existing.status,
            to: status,
            comment: comment ?? null,
          },
        },
      }),
    ]);
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/account/orders');
  revalidatePath(`/account/orders/${orderId}`);
  return { ok: true };
}
