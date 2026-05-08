import { EventEmitter } from 'node:events';
import type { AdminEvent } from './admin-events';

declare global {
  var __WH_ADMIN_EVENT_BUS: EventEmitter | undefined;
}

const bus = globalThis.__WH_ADMIN_EVENT_BUS ?? new EventEmitter();
if (!globalThis.__WH_ADMIN_EVENT_BUS) {
  bus.setMaxListeners(100);
  globalThis.__WH_ADMIN_EVENT_BUS = bus;
}

const CHANNEL = 'admin';

export function emitAdminEvent(event: AdminEvent): void {
  bus.emit(CHANNEL, event);
}

export function onAdminEvent(handler: (event: AdminEvent) => void): () => void {
  bus.on(CHANNEL, handler);
  return () => bus.off(CHANNEL, handler);
}
