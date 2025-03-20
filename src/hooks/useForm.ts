import { useState } from 'react';

interface FormState<T> {
  errors: {
    root?: { message?: string };
    [key: string]: any;
  };
  isSubmitting: boolean;
  data: T;
}

interface UseFormOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useForm<T>(
  submitFn: (data: T) => Promise<any>,
  options: UseFormOptions<T> = {}
) {
  const [formState, setFormState] = useState<FormState<T>>({
    errors: {},
    isSubmitting: false,
    data: {} as T,
  });

  const register = (name: keyof T) => ({
    name,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({
        ...prev,
        data: { ...prev.data, [name]: e.target.value },
      }));
    },
    value: formState.data[name] || '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      const result = await submitFn(formState.data);
      options.onSuccess?.(result);
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setFormState(prev => ({
        ...prev,
        errors: { root: { message: errorMessage } },
      }));
      options.onError?.(error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    register,
    submit,
    formState: {
      errors: formState.errors,
      isSubmitting: formState.isSubmitting,
    },
  };
} 