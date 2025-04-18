import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFindOneResult<T> {
  data: T | null;
  error: Error | null;
  fetching: boolean;
}

interface UseFindOneOptions {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  dependencies?: any[];
  cacheTime?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export function useFindOne<T>(
  fetchFn: () => Promise<T>,
  options: UseFindOneOptions = {}
): [UseFindOneResult<T>, { refetch: () => Promise<void> }] {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetching, setFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Cache management
  const cache = useRef<{
    data: T | null;
    timestamp: number;
  }>({
    data: null,
    timestamp: 0
  });

  const fetchData = useCallback(async () => {
    // Don't fetch if disabled
    if (options.enabled === false) {
      return;
    }

    // Check cache first
    const now = Date.now();
    const isStale = now - cache.current.timestamp > (options.staleTime || 0);
    const isExpired = now - cache.current.timestamp > (options.cacheTime || 0);

    if (cache.current.data && !isStale && !isExpired) {
      setData(cache.current.data);
      return;
    }

    setFetching(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      setRetryCount(0);
      // Update cache
      cache.current = {
        data: result,
        timestamp: now
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      
      // Don't retry if it's an authentication error
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return;
      }
      
      // Handle retries for other errors
      if (retryCount < (options.maxRetries || 3)) {
        const delay = (options.retryDelay || 1000) * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      }
    } finally {
      setFetching(false);
    }
  }, [fetchFn, options.enabled, retryCount, options.staleTime, options.cacheTime, options.maxRetries, options.retryDelay]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const executeFetch = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    executeFetch();

    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchData]);

  return [
    { data, error, fetching },
    { refetch: fetchData }
  ];
} 
