import { useState, useEffect } from 'react';

interface FindManyOptions<T> {
  filter?: Record<string, any>;
  sort?: Record<string, 'Ascending' | 'Descending'>;
  select?: Record<string, boolean>;
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

  const fetchData = async () => {
    setState(prev => ({ ...prev, fetching: true }));
    try {
      const data = await apiEndpoint();
      setState({
        data,
        fetching: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        fetching: false,
        error: error as Error,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return [state, fetchData];
} 