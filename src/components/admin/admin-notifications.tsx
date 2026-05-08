'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import type { AdminEvent, OrderCreatedEvent } from '@/lib/admin-events';
import { formatUah } from '@/lib/money';

const TOAST_TTL_MS = 12_000;
const MAX_VISIBLE = 3;

type Toast = {
  id: string;
  event: OrderCreatedEvent;
  expiresAt: number;
};

export function AdminNotifications() {
  const t = useTranslations('admin.notifications');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const source = new EventSource('/api/admin/notifications/stream');

    source.addEventListener('open', () => setConnected(true));
    source.addEventListener('error', () => setConnected(false));

    source.addEventListener('order.created', (raw) => {
      try {
        const event = JSON.parse(raw.data) as AdminEvent;
        if (event.type !== 'order.created') return;
        const id = `${event.orderId}-${Date.now()}`;
        setToasts((prev) =>
          [
            { id, event, expiresAt: Date.now() + TOAST_TTL_MS },
            ...prev,
          ].slice(0, MAX_VISIBLE),
        );
      } catch {
        /* ignore malformed payload */
      }
    });

    return () => {
      source.close();
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => t.expiresAt > now));
    }, 1000);
    return () => clearInterval(timer);
  }, [toasts.length]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3"
    >
      <div
        className="pointer-events-auto self-end rounded-sm border border-bone/10 bg-ash/80 px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur"
        title={connected ? t('connected') : t('disconnected')}
      >
        <span
          className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${
            connected ? 'bg-emerald-400' : 'bg-bone/40'
          }`}
        />
        {connected ? t('live') : t('offline')}
      </div>

      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="pointer-events-auto flex flex-col gap-2 rounded-sm border border-gold/40 bg-ash/95 p-4 shadow-2xl backdrop-blur"
        >
          <header className="flex items-start justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{t('newOrder')}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t('dismiss')}
              className="text-bone/50 transition hover:text-bone"
            >
              ×
            </button>
          </header>
          <Link
            href={`/admin/orders/${toast.event.orderId}`}
            onClick={() => dismiss(toast.id)}
            className="block"
          >
            <p className="font-display text-lg leading-tight">{toast.event.orderNumber}</p>
            <p className="mt-1 text-sm text-bone/70">{toast.event.customerEmail}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-bone/60">
                {t('items', { n: toast.event.itemsCount })}
              </span>
              <span className="font-display">{formatUah(toast.event.totalUah, 'uk')}</span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
