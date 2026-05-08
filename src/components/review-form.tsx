'use client';

import type { Review } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { submitReviewAction, type ReviewFormState } from '@/server/actions/reviews';

export function ReviewForm({
  productId,
  existing,
}: {
  productId: string;
  existing: Review | null;
}) {
  const t = useTranslations('product.reviewForm');
  const [state, action, pending] = useActionState<ReviewFormState | undefined, FormData>(
    submitReviewAction,
    undefined,
  );
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [hover, setHover] = useState<number>(0);

  const fieldError = (name: keyof NonNullable<ReviewFormState['fieldErrors']>) =>
    state?.fieldErrors?.[name]?.[0];

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-sm border border-bone/10 bg-ash/40 p-6"
    >
      <h3 className="font-display text-lg uppercase tracking-tight">
        {existing ? t('editTitle') : t('createTitle')}
      </h3>

      {existing && !existing.approved && (
        <p className="rounded-sm border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs uppercase tracking-widest text-amber-300">
          {t('pending')}
        </p>
      )}

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-xs uppercase tracking-widest text-bone/60">{t('rating')}</p>
        <div
          role="radiogroup"
          aria-label={t('rating')}
          className="mt-2 flex items-center gap-1 text-3xl"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hover || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n}`}
                className={
                  filled
                    ? 'text-gold transition'
                    : 'text-bone/20 transition hover:text-gold/60'
                }
              >
                ★
              </button>
            );
          })}
        </div>
        {fieldError('rating') && (
          <p className="mt-1 text-xs text-red-400">{t('errors.rating')}</p>
        )}
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('titleField')}</span>
        <input
          name="title"
          maxLength={120}
          defaultValue={existing?.title ?? ''}
          className="rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
        {fieldError('title') && <span className="text-xs text-red-400">{t('errors.title')}</span>}
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="uppercase tracking-wider text-bone/70">{t('body')}</span>
        <textarea
          name="body"
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          defaultValue={existing?.body ?? ''}
          className="rounded-sm border border-bone/20 bg-ash/40 px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
        {fieldError('body') && <span className="text-xs text-red-400">{t('errors.body')}</span>}
      </label>

      {state?.error && state.error !== 'invalid_input' && (
        <p className="text-sm text-red-400">{t(`errors.${state.error}`)}</p>
      )}
      {state?.ok && <p className="text-sm text-emerald-400">{t('saved')}</p>}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="self-start rounded-sm bg-blood px-6 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/80 disabled:opacity-50"
      >
        {pending ? t('sending') : existing ? t('update') : t('submit')}
      </button>
    </form>
  );
}
