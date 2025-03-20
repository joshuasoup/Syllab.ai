import { useState } from 'react';

interface ActionState {
  fetching: boolean;
  error: Error | null;
}

export type ActionFunction<TData, TResult> = (data: TData) => Promise<TResult>;

export function useAction<TData, TResult>(
  action: (data: TData) => Promise<TResult>
): [ActionState, (data: TData) => Promise<TResult>] {
  const [state, setState] = useState<ActionState>({
    fetching: false,
    error: null,
  });

  const execute = async (data: TData) => {
    setState({ fetching: true, error: null });
    try {
      const result = await action(data);
      setState({ fetching: false, error: null });
      return result;
    } catch (error) {
      setState({ fetching: false, error: error as Error });
      throw error;
    }
  };

  return [state, execute];
} 