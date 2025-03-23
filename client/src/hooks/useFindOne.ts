import { useState, useEffect } from 'react';

interface UseFindOneResult<T> {
  data: T | null;
  error: Error | null;
  fetching: boolean;
}

export function useFindOne<T>(
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean } = {}
): [UseFindOneResult<T>] {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (options.enabled === false) {
      return;
    }

    const fetchData = async () => {
      setFetching(true);
      try {
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [fetchFn, options.enabled]);

  return [{ data, error, fetching }];
} 