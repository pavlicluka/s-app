/**
 * Save retry utility with skip-lint support
 * Enables users to retry save operations even when lint checks fail
 */

export interface SaveRetryOptions {
  maxRetries?: number;
  skipLint?: boolean;
  onRetry?: (attempt: number, skipLint: boolean) => Promise<boolean>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export class SaveRetryManager {
  private maxRetries: number;
  private currentAttempt: number = 0;
  private skipLint: boolean = false;
  private onRetry?: (attempt: number, skipLint: boolean) => Promise<boolean>;
  private onSuccess?: () => void;
  private onError?: (error: Error) => void;

  constructor(options: SaveRetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.onRetry = options.onRetry;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
  }

  /**
   * Attempt to save with retry logic
   */
  async save(): Promise<boolean> {
    try {
      if (this.onRetry) {
        const success = await this.onRetry(this.currentAttempt + 1, this.skipLint);
        if (success) {
          this.onSuccess?.();
          this.reset();
          return true;
        }
      }
      return false;
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Set skip-lint flag for next retry
   */
  setSkipLint(skip: boolean): void {
    this.skipLint = skip;
  }

  /**
   * Check if user can retry (hasn't exceeded max retries)
   */
  canRetry(): boolean {
    return this.currentAttempt < this.maxRetries;
  }

  /**
   * Get remaining retries
   */
  getRemainingRetries(): number {
    return Math.max(0, this.maxRetries - this.currentAttempt);
  }

  /**
   * Increment attempt counter
   */
  incrementAttempt(): void {
    this.currentAttempt++;
  }

  /**
   * Reset state
   */
  private reset(): void {
    this.currentAttempt = 0;
    this.skipLint = false;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      attempt: this.currentAttempt,
      skipLint: this.skipLint,
      canRetry: this.canRetry(),
      remainingRetries: this.getRemainingRetries(),
    };
  }
}

/**
 * Utility function to format lint errors for display
 */
export function formatLintErrors(errors: Array<{ message: string; file?: string; line?: number }>): string {
  if (errors.length === 0) return 'No errors found';
  
  return errors
    .map((err) => {
      let msg = err.message;
      if (err.file) msg = `${err.file}: ${msg}`;
      if (err.line) msg = `${msg} (line ${err.line})`;
      return msg;
    })
    .join('\n');
}
