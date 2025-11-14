# Save Retry Mechanism - Usage Guide

## Overview

The save retry mechanism allows users to retry save operations when lint checks fail, with the option to skip lint validation on retry.

## Components

### 1. `SaveRetryDialog` Component

Located in: `src/components/common/SaveRetryDialog.tsx`

Displays a retry dialog when save fails due to lint errors.

**Props:**
- `isOpen: boolean` - Whether the dialog is visible
- `onClose: () => void` - Called when user closes/cancels
- `onRetry: (skipLint: boolean) => void` - Called when user clicks retry
- `isLoading?: boolean` - Whether retry is in progress
- `lintErrors?: Array` - List of lint errors to display
- `attemptNumber?: number` - Current retry attempt number
- `maxRetries?: number` - Maximum retry attempts allowed

**Features:**
- Shows attempt counter (e.g., "Attempt 2 of 3")
- Displays lint errors in a scrollable list (first 5 shown)
- Checkbox to skip lint checks on retry
- Disabled retry button when max retries exceeded

### 2. `useSaveRetry` Hook

Located in: `src/hooks/useSaveRetry.tsx`

React hook for managing save retry state and logic.

**Usage:**

```typescript
import { useSaveRetry } from '@/hooks/useSaveRetry';

function MyComponent() {
  const {
    isDialogOpen,
    isLoading,
    lintErrors,
    attemptNumber,
    maxRetries,
    save,
    retry,
    closeDialog,
    reset
  } = useSaveRetry({
    maxRetries: 3,
    onSave: async (skipLint) => {
      // Your save logic here
      const response = await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ skipLint }),
      });
      
      const data = await response.json();
      return {
        success: data.success,
        errors: data.errors // Lint errors if save failed
      };
    },
    onSuccess: () => {
      console.log('Save succeeded!');
    },
    onError: (error) => {
      console.error('Save failed:', error);
    },
  });

  return (
    <>
      <button onClick={() => save()}>Save</button>

      <SaveRetryDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onRetry={retry}
        isLoading={isLoading}
        lintErrors={lintErrors}
        attemptNumber={attemptNumber}
        maxRetries={maxRetries}
      />
    </>
  );
}
```

### 3. `SaveRetryManager` Utility

Located in: `src/utils/saveRetry.ts`

Low-level class for managing retry state and logic.

**Methods:**
- `save(): Promise<boolean>` - Attempt to save
- `setSkipLint(skip: boolean)` - Set skip-lint flag
- `canRetry(): boolean` - Check if retries remaining
- `getRemainingRetries(): number` - Get remaining attempts
- `incrementAttempt()` - Increment attempt counter
- `getState()` - Get current state

**Example:**

```typescript
import { SaveRetryManager } from '@/utils/saveRetry';

const manager = new SaveRetryManager({
  maxRetries: 3,
  onRetry: async (attempt, skipLint) => {
    console.log(`Attempt ${attempt}, skipLint: ${skipLint}`);
    return true; // true if successful
  },
  onSuccess: () => console.log('Saved!'),
  onError: (error) => console.error('Error:', error),
});

await manager.save();
```

## Integration Pattern

### Simple Integration (Using Hook)

```typescript
import SaveRetryDialog from '@/components/common/SaveRetryDialog';
import { useSaveRetry } from '@/hooks/useSaveRetry';

export function CodeEditor() {
  const {
    isDialogOpen,
    isLoading,
    lintErrors,
    attemptNumber,
    maxRetries,
    save,
    retry,
    closeDialog,
  } = useSaveRetry({
    onSave: async (skipLint) => {
      try {
        // Call your save API
        const response = await fetch('/api/files/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editorContent,
            skipLint, // Pass skip-lint flag to backend
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            errors: data.errors || [{ message: data.message }],
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          errors: [{ message: error.message }],
        };
      }
    },
    onSuccess: () => {
      showToast('File saved successfully!', 'success');
    },
    onError: (error) => {
      showToast(`Save failed: ${error.message}`, 'error');
    },
  });

  return (
    <>
      <div>
        {/* Your editor content */}
      </div>

      <button onClick={() => save()}>Save Changes</button>

      <SaveRetryDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onRetry={retry}
        isLoading={isLoading}
        lintErrors={lintErrors}
        attemptNumber={attemptNumber}
        maxRetries={maxRetries}
      />
    </>
  );
}
```

## Backend Implementation

Your backend save endpoint should:

1. Accept `skipLint` parameter
2. Run lint checks if `skipLint` is false
3. Return lint errors if validation fails
4. Save file only if lint passes or `skipLint` is true

**Example (Express/Node.js):**

```typescript
app.post('/api/files/save', async (req, res) => {
  const { content, skipLint } = req.body;

  if (!skipLint) {
    // Run lint checks
    const lintResult = await runLint(content);
    
    if (!lintResult.success) {
      return res.status(400).json({
        success: false,
        errors: lintResult.errors,
      });
    }
  }

  // Save the file
  try {
    await saveFile(content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [{ message: error.message }],
    });
  }
});
```

## Features

✅ **Retry Logic** - Users can retry save operations multiple times
✅ **Skip Lint** - Option to bypass lint checks on retry
✅ **Attempt Tracking** - Shows current attempt number and remaining retries
✅ **Error Display** - Shows first 5 lint errors with overflow indicator
✅ **Loading State** - Disables buttons during retry operation
✅ **Max Retries** - Prevents infinite retry loops
✅ **Callbacks** - Success, error, and custom retry callbacks

## Configuration

Customize the retry behavior by passing options to `useSaveRetry`:

```typescript
const { save, retry } = useSaveRetry({
  maxRetries: 5,              // Allow up to 5 retry attempts
  onSave: myCustomSaveFunc,   // Your save implementation
  onSuccess: () => {},        // Called on successful save
  onError: (error) => {},     // Called on final failure
  onRetry: async (attempt, skipLint) => {
    // Custom pre-retry logic
    return true; // Return success/failure
  },
});
```

## Error Handling

The system handles:
- Lint validation failures
- Network/API errors
- Exceeding max retry attempts
- User cancellation

All errors are passed to the `onError` callback for centralized handling.

## Accessibility

The dialog includes:
- Proper ARIA labels via Radix UI
- Keyboard navigation support
- Clear disabled states
- Semantic HTML structure

## TypeScript Support

Full TypeScript support with proper types for all components and utilities:

```typescript
import type { SaveRetryDialogProps } from '@/components/common/SaveRetryDialog';
import type { UseSaveRetryOptions } from '@/hooks/useSaveRetry';
```
