import { useState } from 'react';
import type { ReportRequest, ReportResponse } from '@running-lore/shared';

interface UseReportResult {
  generate: (request: ReportRequest) => Promise<void>;
  result: ReportResponse | null;
  error: string | null;
  loading: boolean;
}

export function useReport(): UseReportResult {
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (request: ReportRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }

      setResult(data as ReportResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { generate, result, error, loading };
}
