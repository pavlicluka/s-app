import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle } from 'lucide-react'

interface SaveRetryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (skipLint: boolean) => void;
  isLoading?: boolean;
  lintErrors?: Array<{ message: string; file?: string; line?: number }>;
  attemptNumber?: number;
  maxRetries?: number;
}

export default function SaveRetryDialog({
  isOpen,
  onClose,
  onRetry,
  isLoading = false,
  lintErrors = [],
  attemptNumber = 1,
  maxRetries = 3,
}: SaveRetryDialogProps) {
  const [skipLint, setSkipLint] = useState(false);

  const handleRetry = () => {
    onRetry(skipLint);
  };

  const remainingRetries = Math.max(0, maxRetries - attemptNumber);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <AlertDialogTitle>Save Failed Due to Lint Errors</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            <div className="space-y-3">
              <p>
                Attempt <span className="font-semibold">{attemptNumber}</span> of{' '}
                <span className="font-semibold">{maxRetries}</span> | Remaining retries:{' '}
                <span className="font-semibold text-text-primary">{remainingRetries}</span>
              </p>

              {lintErrors.length > 0 && (
                <div className="bg-bg-surface rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-body-sm font-medium text-text-secondary mb-2">
                    Lint errors ({lintErrors.length}):
                  </p>
                  <ul className="space-y-1 text-body-sm text-text-tertiary">
                    {lintErrors.slice(0, 5).map((error, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>{error.message}</span>
                      </li>
                    ))}
                    {lintErrors.length > 5 && (
                      <li className="text-text-secondary font-medium">
                        ... and {lintErrors.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center space-x-2 border border-border-subtle rounded p-3">
                <Checkbox
                  id="skip-lint"
                  checked={skipLint}
                  onCheckedChange={(checked) => setSkipLint(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="skip-lint"
                  className="text-body-sm cursor-pointer flex-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Skip lint checks on retry
                </label>
              </div>

              <p className="text-body-xs text-text-tertiary">
                You can retry the save operation. Optionally, skip lint checks to force save changes despite errors.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRetry}
            disabled={isLoading || remainingRetries <= 0}
            className="bg-accent-primary hover:bg-accent-primary/80"
          >
            {isLoading ? 'Retrying...' : `Retry${skipLint ? ' (Skip Lint)' : ''}`}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
