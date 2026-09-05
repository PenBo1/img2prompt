# Coding Conventions

Code style and best practices for img2prompt.

## Import Conventions

### Use Path Aliases

```typescript
// ✅ Good - use aliases
import { Button } from '@/components/ui/button';
import { apiClient } from '~/lib/api-client';
import { useImageCapture } from '~/hooks/useImageCapture';
import { APIConfig } from '~/types/api';

// ❌ Bad - avoid deep relative paths
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../lib/api-client';
```

### WXT API Imports

```typescript
// ✅ Good - explicit import from #imports
import { storage, createShadowRootUi, ContentScriptContext } from '#imports';

// ✅ Also works - auto-imported by WXT
storage.getItem('key');
```

## WXT-Specific Rules

### Background Scripts

**ALL runtime code must be inside `main()`, cannot be `async`**:

```typescript
// ✅ Correct
export default defineBackground(() => {
  // ALL browser API calls here
  browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });

  browser.runtime.onMessage.addListener((message) => {
    // Handle message
  });
});

// ❌ Wrong - code outside main() runs at build time in Node.js
browser.runtime.onInstalled.addListener(() => { ... });

export default defineBackground(() => {
  // This will NOT work as expected
});
```

### Content Scripts

Use `defineContentScript()` for type safety:

```typescript
// ✅ Correct
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle', // optional
  main(ctx) {
    // Content script logic
    console.log('Content script loaded');
  },
});

// ❌ Wrong - missing type safety
export default () => {
  console.log('Content script loaded');
};
```

### Auto-imports

Components in `src/components/`, hooks in `src/hooks/`, utils in `src/utils/` are auto-imported:

```typescript
// No import needed for components in src/components/
import MyComponent from '@/components/MyComponent'; // explicit import also works

// Hooks in src/hooks/ are auto-imported
const image = useImageCapture(); // no import needed
```

## File Organization

### Directory Structure

```
src/
├── entrypoints/        # Extension entry points
│   ├── background.ts   # Service worker
│   ├── content.ts      # Content script
│   ├── popup/          # Popup UI
│   └── options/        # Settings page
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Custom components
├── hooks/             # Custom React hooks
│   └── use*.ts        # Hook files
├── lib/               # Utilities and helpers
│   ├── api-client.ts  # API integration
│   ├── storage.ts     # Storage wrapper
│   └── utils.ts       # Utility functions
├── types/             # TypeScript type definitions
│   ├── api.ts         # API types
│   ├── config.ts      # Config types
│   └── prompt.ts      # Prompt types
└── utils/             # Pure utility functions
    └── *.ts           # Utility files
```

### File Naming

- **Components**: PascalCase - `ImageCapture.tsx`
- **Hooks**: camelCase with `use` prefix - `useImageCapture.ts`
- **Utilities**: camelCase - `image-utils.ts`
- **Types**: camelCase - `api.ts`

## React Best Practices

### Functional Components

```typescript
// ✅ Good - functional components with hooks
export function ImageCapture({ onSelect }: ImageCaptureProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = useCallback(() => {
    setIsSelecting(true);
  }, []);

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}

// ❌ Bad - class components (avoid)
export class ImageCapture extends React.Component {
  // ...
}
```

### Use Tailwind CSS

```typescript
// ✅ Good - use Tailwind utility classes
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
  Click me
</button>

// ❌ Bad - inline styles
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click me
</button>
```

### Use shadcn/ui Components

```typescript
// ✅ Good - use shadcn/ui
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ❌ Bad - create custom components when shadcn/ui exists
```

## TypeScript Best Practices

### Strict Types

```typescript
// ✅ Good - explicit types
interface APIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// ❌ Bad - any type
const config: any = { ... };
```

### Type Guards

```typescript
// ✅ Good - type guards
function isAPIError(error: unknown): error is APIError {
  return error instanceof Error && 'status' in error;
}

if (isAPIError(error)) {
  console.log(error.status);
}
```

### Avoid `any`

```typescript
// ✅ Good - use unknown for error handling
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad - using any
try {
  // ...
} catch (error: any) {
  console.error(error.message);
}
```

## Error Handling

### Use Typed Errors

```typescript
// ✅ Good
class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

throw new APIError(401, 'Invalid API key');

// ❌ Bad
throw new Error('Something went wrong');
```

### User-Friendly Messages

```typescript
// ✅ Good - i18n error messages
const error = t('errorInvalidAPIKey');
showToast(error, 'error');

// ❌ Bad - hardcoded messages
showToast('Invalid API key', 'error');
```

## Code Style

### Linting

Use ESLint with recommended rules:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ]
}
```

### Formatting

Use Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Git Conventions

### Commit Messages

Follow Conventional Commits:

```
feat: add dual language prompt generation
fix: handle cross-origin image capture
docs: update i18n documentation
style: format code with prettier
refactor: extract image processing logic
test: add unit tests for image utils
chore: update dependencies
```

### Branch Names

```
feature/dual-language-prompts
fix/image-capture-cors
docs/architecture-guide
refactor/api-client
```

## Performance Guidelines

### Lazy Loading

```typescript
// ✅ Good - lazy load components
const APISettings = lazy(() => import('@/components/APISettings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <APISettings />
    </Suspense>
  );
}
```

### Memoization

```typescript
// ✅ Good - memoize expensive operations
const processedImage = useMemo(
  () => processImage(imageData),
  [imageData]
);

// ✅ Good - stable callback references
const handleSelect = useCallback(() => {
  // ...
}, [dependency]);
```

## Security Guidelines

### Never Store API Keys in Code

```typescript
// ❌ NEVER do this
const API_KEY = 'sk-1234567890';

// ✅ Good - use storage
const apiKey = await getAPIKey(); // From chrome.storage.local
```

### Sanitize User Input

```typescript
// ✅ Good - sanitize before display
const sanitizedPrompt = DOMPurify.sanitize(userPrompt);

// ❌ Bad - insert raw HTML
element.innerHTML = userPrompt;
```

---

**Related**: [Setup](setup.md) | [Testing](testing.md) | [Debugging](debugging.md)