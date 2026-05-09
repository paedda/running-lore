import { useState } from 'react';
import type { ReportImage, ReportRequest, ReportResponse } from '@running-lore/shared';
import { parseResponse } from '../utils/parseResponse';

interface UseReportResult {
  generate: (request: ReportRequest, images?: ReportImage[]) => Promise<void>;
  result: ReportResponse | null;
  error: string | null;
  loading: boolean;
}

export function useReport(): UseReportResult {
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (request: ReportRequest, images?: ReportImage[]): Promise<void> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, images: images ?? [] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(parseResponse(accumulated));
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { generate, result, error, loading };
}
