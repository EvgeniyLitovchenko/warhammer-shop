export function formatSseEvent(name: string, data: unknown): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function formatSseComment(text: string): string {
  return `: ${text}\n\n`;
}
