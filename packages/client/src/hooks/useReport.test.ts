import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReport } from './useReport';

const mockRequest = {
  activity: {
    raceName: 'Test Race',
    date: '2025-05-18',
    distance: '10K',
    finishTime: '45:00',
    averagePace: '7:15/mi',
  },
  notes: ['Felt good'],
  tone: 'storytelling' as const,
};

describe('useReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with empty state', () => {
    const { result } = renderHook(() => useReport());
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets loading during generation', async () => {
    let resolveResponse!: (value: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((resolve) => { resolveResponse = resolve; }),
    );

    const { result } = renderHook(() => useReport());

    let generatePromise: Promise<void>;
    act(() => {
      generatePromise = result.current.generate(mockRequest);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveResponse(Response.json({ title: 'Test', report: 'Body' }));
      await generatePromise!;
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets result on successful response', async () => {
    const mockResponse = { title: 'Race Day', report: 'It was great.' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(mockResponse));

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.generate(mockRequest);
    });

    expect(result.current.result).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ error: 'API key invalid' }, { status: 401 }),
    );

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.generate(mockRequest);
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('API key invalid');
  });

  it('sets error on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.generate(mockRequest);
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('sends POST to correct endpoint with JSON body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ title: 'T', report: 'R' }),
    );

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.generate(mockRequest);
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockRequest),
    });
  });

  it('clears previous result and error on new generation', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ error: 'fail' }, { status: 500 }))
      .mockResolvedValueOnce(Response.json({ title: 'OK', report: 'Body' }));

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.generate(mockRequest);
    });
    expect(result.current.error).toBe('fail');

    await act(async () => {
      await result.current.generate(mockRequest);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual({ title: 'OK', report: 'Body' });
  });
});
