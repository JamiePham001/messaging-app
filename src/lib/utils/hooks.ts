// Custom hooks wrapping useCachedFetch for common data patterns

import { useEffect, useState } from "react";
import { getCached, setCache, invalidateCache, useCachedFetch } from "./cache";

type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useData<T>(key: string, url: string, options?: RequestInit): FetchResult<T> {
  const [data, setData] = useState<T | null>(() => getCached(key) ?? null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (data) return; // already cached

    let cancelled = false;
    setLoading(true);
    useCachedFetch<T>(url, options).then(
      (result) => {
        if (!cancelled) {
          setData(result as T);
          setCache(key, result as T);
          setLoading(false);
        }
      },
      (err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      },
    );

    return () => { cancelled = true; };
  }, [key, url]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

export function useInvalidate() {
  const invalidate = (keys?: string[]) => invalidateCache(keys);
  return invalidate;
}
