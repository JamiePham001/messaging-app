// Lightweight request deduplication + TTL-based response cache for client-side fetches
// Usage: useCachedFetch(key, url, options) or invalidateCache(keys)

type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Generate a stable key from URL + options
function makeKey(url: string, options?: RequestInit): string {
  const body = options?.body ? JSON.stringify(options.body) : "";
  return `${url}::${options?.method ?? "GET"}::${body}`;
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(keys?: string[]): void {
  if (keys) {
    keys.forEach((k) => cache.delete(k));
  } else {
    cache.clear();
  }
}

// Deduplicate concurrent requests for the same key
async function dedupedFetch<T>(key: string, url: string, options?: RequestInit): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetch(url, options).then((res) => res.json());
  pendingRequests.set(key, promise);

  try {
    const data = await promise;
    setCache(key, data);
    return data as T;
  } finally {
    pendingRequests.delete(key);
  }
}

export async function useCachedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const key = makeKey(url, options);
  const cached = getCached<T>(key);
  if (cached) return cached;
  return dedupedFetch<T>(key, url, options);
}
