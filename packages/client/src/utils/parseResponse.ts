import type { ReportResponse } from '@running-lore/shared';

export function parseResponse(text: string): ReportResponse {
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Race Report';
  const report = titleMatch ? text.replace(/^#\s+.+\n*/, '').trim() : text;
  return { title, report };
}
