import { auth } from '@/auth';
import type { AdminEvent } from '@/lib/admin-events';
import { onAdminEvent } from '@/lib/event-bus';
import { formatSseComment, formatSseEvent } from '@/lib/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 25_000;

export async function GET(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== 'ADMIN' && role !== 'MANAGER')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const enqueue = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* connection closed */
        }
      };

      enqueue(formatSseComment('connected'));

      const handler = (event: AdminEvent) => {
        enqueue(formatSseEvent(event.type, event));
      };
      unsubscribe = onAdminEvent(handler);

      heartbeat = setInterval(() => enqueue(formatSseComment('heartbeat')), HEARTBEAT_MS);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
    },
  });

  req.signal.addEventListener('abort', () => {
    if (heartbeat) clearInterval(heartbeat);
    if (unsubscribe) unsubscribe();
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
