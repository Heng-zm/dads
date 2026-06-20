import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/lib/api';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {},
): UseApiResult<T> {
  const { immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [immediate, refetch]);

  return { data, loading, error, refetch, setData };
}

// Mutation hook for POST/PATCH/DELETE actions
export function useMutation<TInput, TResult = void>(
  mutator: (input: TInput) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (input: TInput): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(input);
        return result;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator],
  );

  return { mutate, loading, error };
}
