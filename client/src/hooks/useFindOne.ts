import { useState, useEffect } from 'react';

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
}

export function useFindOne<T>(
  fetchFn: () => Promise<T>,
  options: UseFindOneOptions = {}
): [UseFindOneResult<T>] {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetching, setFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Don't fetch if disabled
    if (options.enabled === false) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      setFetching(true);
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
        setRetryCount(0); // Reset retry count on success
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
          timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      } finally {
        setFetching(false);
      }
    };

    fetchData();

    // Cleanup function to clear any pending timeouts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchFn, options.enabled, retryCount, ...(options.dependencies || [])]);

  return [{ data, error, fetching }];
} 
