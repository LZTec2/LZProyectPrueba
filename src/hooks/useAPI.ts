import { useState, useEffect } from 'react';

export interface APIError {
  message: string;
  status?: number;
}

export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

export const useAPI = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const apiError: APIError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: (error as any)?.status,
      };
      setState({ data: null, loading: false, error: apiError });
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { ...state, refetch: execute };
};

export const useAsyncAction = <T, P extends any[]>(
  action: (...args: P) => Promise<T>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const execute = async (...args: P): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await action(...args);
      setLoading(false);
      return result;
    } catch (err) {
      const apiError: APIError = {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        status: (err as any)?.status,
      };
      setError(apiError);
      setLoading(false);
      return null;
    }
  };

  return { execute, loading, error };
};