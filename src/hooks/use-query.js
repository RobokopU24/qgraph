import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';

const CACHE_TTL_MS = 30 * 60 * 1000;
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;

const QueryCacheContext = createContext(null);

export const QueryCacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());

  const get = useCallback((key) => {
    const entry = cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL_MS) {
      setCache((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      return undefined;
    }

    return entry.data;
  }, [cache]);

  const set = useCallback((key, value) => {
    setCache((prev) => {
      const next = new Map(prev);
      next.set(key, { data: value, timestamp: Date.now() });
      return next;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        const now = Date.now();
        const next = new Map(prev);
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, entry] of next.entries()) {
          if (now - entry.timestamp > CACHE_TTL_MS) {
            next.delete(key);
          }
        }
        return next;
      });
    }, PRUNE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryCacheContext.Provider value={{ get, set }}>
      {children}
    </QueryCacheContext.Provider>
  );
};

export const useQuery = ({
  queryFn,
  queryKey,
  debounceMs = 0,
  keepStaleData = false,
}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cache = useContext(QueryCacheContext);
  if (!cache) throw new Error('You must use `useQuery` hook within `QueryCacheProvider`');

  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    timeoutRef.current = setTimeout(() => {
      (async () => {
        if (!keepStaleData) setData(null);
        setIsLoading(true);
        setError(null);

        const cachedData = cache.get(queryKey);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const d = await queryFn(controller.signal);

          if (ignore) return;

          cache.set(queryKey, d);
          setData(d);
          setIsLoading(false);
        } catch (err) {
          if (!controller.signal.aborted) {
            setError((Boolean(err) && err.message) || 'Unknown error');
            setIsLoading(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      ignore = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };

    // Don't rerender if queryFn is different, this can cause an endless render loop if
    // the component calling useQuery uses a closure like queryFn: () => fetchFn(someLocalVar).

    // This could be fixed by wrapping the closure in a useCallback in the calling component
    // or including a dependency array in this hook. All should work fine if all the queryFn
    // depends on is included in the queryKey.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, cache, debounceMs]);

  return { data, isLoading, error };
};
