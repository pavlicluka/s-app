import { useState, useCallback, useMemo } from 'react';
import { SaveRetryManager, SaveRetryOptions } from '@/utils/saveRetry';

interface UseSaveRetryOptions extends SaveRetryOptions {
  onSave: (skipLint?: boolean) => Promise<{ success: boolean; errors?: Array<{ message: string; file?: string; line?: number }> }>;
}

export function useSaveRetry(options: UseSaveRetryOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lintErrors, setLintErrors] = useState<Array<{ message: string; file?: string; line?: number }>>([]);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [maxRetries] = useState(options.maxRetries ?? 3);

  const manager = useMemo(
    () =>
      new SaveRetryManager({
        maxRetries: options.maxRetries,
        onRetry: options.onRetry,
        onSuccess: options.onSuccess,
        onError: options.onError,
      }),
    [options.maxRetries, options.onRetry, options.onSuccess, options.onError]
  );

  const handleSave = useCallback(
    async (skipLint = false) => {
      setIsLoading(true);
      try {
        const result = await options.onSave(skipLint);

        if (result.success) {
          // Save succeeded
          setIsOpen(false);
          setAttemptNumber(1);
          setLintErrors([]);
          options.onSuccess?.();
          return true;
        } else {
          // Save failed - lint errors detected
          if (result.errors) {
            setLintErrors(result.errors);
          }

          // Increment attempt and check if we can retry
          manager.incrementAttempt();
          const canRetry = manager.canRetry();

          if (canRetry) {
            setAttemptNumber(manager.getState().attempt + 1);
            setIsOpen(true);
          } else {
            // Max retries exceeded
            setIsOpen(false);
            options.onError?.(new Error('Max retries exceeded. Save operation failed.'));
          }

          return false;
        }
      } catch (error) {
        setIsLoading(false);
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [options, manager]
  );

  const handleRetry = useCallback(
    async (skipLint: boolean) => {
      await handleSave(skipLint);
    },
    [handleSave]
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetState = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setLintErrors([]);
    setAttemptNumber(1);
  }, []);

  return {
    // Dialog state
    isDialogOpen: isOpen,
    isLoading,
    lintErrors,
    attemptNumber,
    maxRetries,

    // Dialog actions
    closeDialog,
    openDialog: () => setIsOpen(true),

    // Save operation
    save: handleSave,
    retry: handleRetry,

    // Utilities
    reset: resetState,
    canRetry: manager.canRetry(),
    remainingRetries: manager.getRemainingRetries(),
  };
}
