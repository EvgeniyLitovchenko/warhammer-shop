import { describe, it, expect } from 'vitest';
import { formatSseComment, formatSseEvent } from './sse';

describe('formatSseEvent', () => {
  it('serialises data as JSON with the named event header', () => {
    const out = formatSseEvent('order.created', { id: '42', total: 1000 });
    expect(out).toBe('event: order.created\ndata: {"id":"42","total":1000}\n\n');
  });

  it('handles primitives and arrays', () => {
    expect(formatSseEvent('ping', null)).toBe('event: ping\ndata: null\n\n');
    expect(formatSseEvent('list', [1, 2])).toBe('event: list\ndata: [1,2]\n\n');
  });

  it('terminates the message with a blank line', () => {
    const out = formatSseEvent('any', {});
    expect(out.endsWith('\n\n')).toBe(true);
  });
});

describe('formatSseComment', () => {
  it('formats a comment line with leading colon', () => {
    expect(formatSseComment('heartbeat')).toBe(': heartbeat\n\n');
  });

  it('terminates with a blank line', () => {
    expect(formatSseComment('hi').endsWith('\n\n')).toBe(true);
  });
});
