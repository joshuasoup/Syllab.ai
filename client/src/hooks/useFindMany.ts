import { useState, useEffect } from 'react';

interface FindManyOptions<T> {
  filter?: Record<string, any>;
  sort?: Record<string, 'Ascending' | 'Descending'>;
  select?: Record<string, boolean>;
  maxRetries?: number;
  retryDelay?: number;
}

interface FindManyState<T> {
  data: T[] | null;
  fetching: boolean;
  error: Error | null;
}

export function useFindMany<T>(
  apiEndpoint: (...args: any[]) => Promise<T[]>,
  options?: FindManyOptions<T>
): [FindManyState<T>, () => void] {
  const [state, setState] = useState<FindManyState<T>>({
    data: null,
    fetching: true,
    error: null,
  });
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(false);

  const fetchData = async () => {
    setState(prev => ({ ...prev, fetching: true }));
    try {
      const data = await apiEndpoint();
      setState({
        data,
        fetching: false,
        error: null,
      });
      setRetryCount(0); // Reset retry count on success
      setShouldRetry(false); // Reset retry flag on success
    } catch (error) {
      setState({
        data: null,
        fetching: false,
        error: error as Error,
      });
      
      // Handle retries
      if (retryCount < (options?.maxRetries || 3)) {
        const delay = (options?.retryDelay || 1000) * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setShouldRetry(true);
        }, delay);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []); // Only run on mount

  // Handle retries
  useEffect(() => {
    if (shouldRetry) {
      fetchData();
      setShouldRetry(false);
    }
  }, [retryCount]); // Only run when retryCount changes

  return [state, fetchData];
} 