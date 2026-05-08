'use client';

import type { OrderStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';
import { ORDER_STATUSES } from '@/lib/validation/admin-order';
import {
  changeOrderStatusAction,
  type ChangeOrderStatusState,
} from '@/server/actions/admin-orders';

export function OrderStatusForm({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const t = useTranslations('admin.orders');
  const tStatus = useTranslations('orders.status');
  const [state, action, pending] = useActionState<ChangeOrderStatusState | undefined, FormData>(
    changeOrderStatusAction,
    undefined,
  );
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-sm border border-bone/10 bg-ash/40 p-6">
      <h2 className="font-display text-sm uppercase tracking-widest text-bone/60">
        {t('changeStatus')}
      </h2>
      <input type="hidden" name="orderId" value={orderId} />

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('newStatus')}</span>
        <select
          name="status"
          defaultValue={current}
          required
          className="rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none focus:border-gold/60"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tStatus(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('commentLabel')}</span>
        <textarea
          name="comment"
          rows={3}
          maxLength={500}
          placeholder={t('commentPlaceholder')}
          className="rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400">{t(`errors.${state.error}`)}</p>
      )}
      {showSaved && <p className="text-sm text-emerald-400">{t('saved')}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-60"
      >
        {pending ? t('saving') : t('save')}
      </button>
    </form>
  );
}
