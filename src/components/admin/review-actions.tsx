'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import {
  approveReviewAction,
  deleteReviewAction,
} from '@/server/actions/reviews';

export function ReviewActions({
  reviewId,
  approved,
}: {
  reviewId: string;
  approved: boolean;
}) {
  const t = useTranslations('admin.reviews');
  const [pending, startTransition] = useTransition();

  const onApprove = () => {
    startTransition(async () => {
      await approveReviewAction({ reviewId });
    });
  };

  const onDelete = () => {
    if (!window.confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      await deleteReviewAction({ reviewId });
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {!approved && (
        <button
          type="button"
          onClick={onApprove}
          disabled={pending}
          className="text-xs uppercase tracking-widest text-emerald-400 transition hover:text-emerald-300 disabled:opacity-40"
        >
          {pending ? '…' : t('approve')}
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-xs uppercase tracking-widest text-bone/60 transition hover:text-red-400 disabled:opacity-40"
      >
        {t('delete')}
      </button>
    </div>
  );
}
