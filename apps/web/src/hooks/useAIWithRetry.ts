import { useState, useCallback } from 'react';

interface UseAIWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export function useAIWithRetry<T>(
  operation: () => Promise<T>,
  options: UseAIWithRetryOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsLoading(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setRetryCount(attempt);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        } else {
          setIsLoading(false);
          throw error;
        }
      }
    }

    setIsLoading(false);
    return null;
  }, [operation, maxRetries, retryDelay]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    return execute();
  }, [execute]);

  return {
    execute,
    retry,
    isLoading,
    error,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
}

