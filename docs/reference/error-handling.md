# Error Handling

Comprehensive error handling guide for img2prompt.

## Error Types

### Extension Error Codes

```typescript
enum ErrorType {
  // API Errors
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_NETWORK_ERROR = 'API_NETWORK_ERROR',
  API_INVALID_RESPONSE = 'API_INVALID_RESPONSE',

  // Image Errors
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  IMAGE_INVALID_FORMAT = 'IMAGE_INVALID_FORMAT',
  IMAGE_CROSS_ORIGIN = 'IMAGE_CROSS_ORIGIN',

  // Permission Errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_TABS = 'PERMISSION_TABS',
  PERMISSION_STORAGE = 'PERMISSION_STORAGE',

  // Storage Errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_CORRUPTED = 'STORAGE_CORRUPTED',

  // Capture Errors
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  SELECTION_CANCELLED = 'SELECTION_CANCELLED',
  SCREENSHOT_FAILED = 'SCREENSHOT_FAILED',
}
```

### Error Class

```typescript
class ExtensionError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public recoverable: boolean = true,
    public userAction?: string
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

// Usage
throw new ExtensionError(
  ErrorType.API_KEY_INVALID,
  'Your API key is invalid',
  true,
  'Please check your API key in settings'
);
```

## Error Handling Strategies

### API Errors

```typescript
// lib/api-client.ts
async function handleAPIError(error: any): Promise<never> {
  // OpenAI errors
  if (error.status === 401) {
    throw new ExtensionError(
      ErrorType.API_KEY_INVALID,
      'Invalid API key',
      true,
      'Check your API key in settings'
    );
  }

  // Rate limit
  if (error.status === 429) {
    throw new ExtensionError(
      ErrorType.API_RATE_LIMIT,
      'Rate limit exceeded',
      true,
      'Please wait a moment and try again'
    );
  }

  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    throw new ExtensionError(
      ErrorType.API_NETWORK_ERROR,
      'Network error',
      true,
      'Check your internet connection'
    );
  }

  // Image too large
  if (error.status === 413) {
    throw new ExtensionError(
      ErrorType.IMAGE_TOO_LARGE,
      'Image too large',
      true,
      'Image will be automatically downscaled'
    );
  }

  // Unknown error
  throw new ExtensionError(
    ErrorType.API_INVALID_RESPONSE,
    error.message || 'Unknown API error',
    true
  );
}
```

### Image Capture Errors

```typescript
// content.ts
async function captureImage(element: HTMLElement): Promise<string> {
  try {
    const imageData = await extractImage(element);

    // Validate size
    if (imageData.length > 20 * 1024 * 1024) { // 20MB
      throw new ExtensionError(
        ErrorType.IMAGE_TOO_LARGE,
        'Image exceeds 20MB limit',
        true,
        'Will be automatically downscaled'
      );
    }

    return imageData;

  } catch (error) {
    if (error.name === 'SecurityError') {
      throw new ExtensionError(
        ErrorType.IMAGE_CROSS_ORIGIN,
        'Cannot capture cross-origin image',
        true,
        'Try using screenshot mode instead'
      );
    }

    throw error;
  }
}
```

### Permission Errors

```typescript
// background.ts
async function checkPermissions(): Promise<void> {
  try {
    const permissions = await browser.permissions.contains({
      permissions: ['activeTab', 'storage', 'tabs'],
    });

    if (!permissions) {
      throw new ExtensionError(
        ErrorType.PERMISSION_DENIED,
        'Required permissions not granted',
        true,
        'Grant permissions in extension settings'
      );
    }
  } catch (error) {
    throw new ExtensionError(
      ErrorType.PERMISSION_DENIED,
      'Permission check failed',
      false
    );
  }
}
```

### Storage Errors

```typescript
// lib/storage.ts
async function saveConfig(config: ExtensionConfig): Promise<void> {
  try {
    await browser.storage.local.set({ config });
  } catch (error) {
    if (error.message.includes('QUOTA_BYTES')) {
      throw new ExtensionError(
        ErrorType.STORAGE_QUOTA_EXCEEDED,
        'Storage quota exceeded',
        true,
        'Clear old history to free space'
      );
    }

    throw new ExtensionError(
      ErrorType.STORAGE_CORRUPTED,
      'Storage error',
      true,
      'Try clearing extension data'
    );
  }
}
```

## User-Facing Error Messages

### Localized Messages

```typescript
// lib/error-messages.ts
const errorMessages: Record<string, Record<string, string>> = {
  en: {
    [ErrorType.API_KEY_INVALID]: 'Your API key is invalid. Please check your settings.',
    [ErrorType.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorType.API_NETWORK_ERROR]: 'Network error. Please check your internet connection.',
    [ErrorType.IMAGE_TOO_LARGE]: 'Image is too large. It will be automatically downscaled.',
    [ErrorType.PERMISSION_DENIED]: 'Permission denied. Please grant the required permissions.',
    [ErrorType.STORAGE_QUOTA_EXCEEDED]: 'Storage full. Some history items have been cleared.',
  },
  zh: {
    [ErrorType.API_KEY_INVALID]: '您的 API 密钥无效。请检查您的设置。',
    [ErrorType.API_RATE_LIMIT]: '请求过多。请稍后再试。',
    [ErrorType.API_NETWORK_ERROR]: '网络错误。请检查您的网络连接。',
    [ErrorType.IMAGE_TOO_LARGE]: '图片过大。将自动缩小。',
    [ErrorType.PERMISSION_DENIED]: '权限被拒绝。请授予所需的权限。',
    [ErrorType.STORAGE_QUOTA_EXCEEDED]: '存储已满。已清除部分历史记录。',
  },
};

export function getErrorMessage(type: ErrorType): string {
  const lang = getUserLanguage(); // 'en' or 'zh'
  return errorMessages[lang][type] || 'An error occurred';
}
```

### Toast Notifications

```typescript
// components/Toast.tsx
function showErrorToast(error: ExtensionError) {
  toast({
    variant: 'destructive',
    title: getErrorMessage(error.type),
    description: error.userAction,
    action: error.recoverable ? {
      label: 'Fix',
      onClick: () => handleUserAction(error),
    } : undefined,
  });
}

function handleUserAction(error: ExtensionError) {
  switch (error.type) {
    case ErrorType.API_KEY_INVALID:
      openSettings();
      break;
    case ErrorType.PERMISSION_DENIED:
      requestPermissions();
      break;
    case ErrorType.STORAGE_QUOTA_EXCEEDED:
      clearOldHistory();
      break;
  }
}
```

## Recovery Strategies

### Automatic Recovery

```typescript
// Retry with backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelay: number;
  }
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Only retry on recoverable errors
      if (error instanceof ExtensionError && !error.recoverable) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = options.baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }

  throw lastError;
}

// Usage
const prompt = await retryWithBackoff(
  () => generatePrompt(imageData, config),
  { maxRetries: 3, baseDelay: 1000 }
);
```

### Fallback Strategies

```typescript
// Fallback to different capture method
async function captureWithFallback(): Promise<string> {
  try {
    return await captureBySelection();
  } catch (error) {
    if (error.type === ErrorType.IMAGE_CROSS_ORIGIN) {
      // Fallback to screenshot
      return await captureByScreenshot();
    }
    throw error;
  }
}

// Fallback to single language
async function generatePromptWithFallback(
  imageData: string,
  config: APIConfig
): Promise<GeneratedPrompt> {
  try {
    return await generateDualLanguagePrompt(imageData, config);
  } catch (error) {
    // Fallback to single language
    const english = await generateSingleLanguagePrompt(imageData, config, 'en');
    return { english, chinese: '' };
  }
}
```

## Error Logging

```typescript
// lib/logger.ts
interface ErrorLog {
  type: ErrorType;
  message: string;
  timestamp: number;
  context?: string;
  stack?: string;
}

async function logError(error: ExtensionError, context?: string) {
  const log: ErrorLog = {
    type: error.type,
    message: error.message,
    timestamp: Date.now(),
    context,
    stack: error.stack,
  };

  // Store locally (limit to last 100 errors)
  const logs = await browser.storage.local.get('errorLogs') || [];
  logs.push(log);
  if (logs.length > 100) logs.shift();
  await browser.storage.local.set({ errorLogs: logs });

  // Optionally send to analytics (if user consented)
  // sendToAnalytics(log);
}
```

## Best Practices

1. **Always use typed errors**: Use ExtensionError class
2. **Provide user actions**: Tell users how to fix the problem
3. **Localize messages**: Support multiple languages
4. **Implement retry logic**: For transient failures
5. **Log errors**: For debugging and analytics
6. **Don't expose internals**: User-friendly messages only
7. **Graceful degradation**: Fallback strategies when possible

---

**Related**: [API Integration](api-integration.md) | [Security Best Practices](../security/best-practices.md)