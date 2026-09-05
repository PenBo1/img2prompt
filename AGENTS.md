# img2prompt - Browser Extension Project

A WXT-based browser extension for converting images to AI image generation prompts with multi-language support.

## Project Overview

**Key Features**:
- **Dual Language Output**: Generates prompts in both English and Chinese
- **Multi-language UI**: Supports EN, ZH (English and Chinese)
- **Multiple Capture Methods**: Image selection, screenshot, drag-drop
- **Custom LLM Integration**: OpenAI, Anthropic, Gemini, custom endpoints
- **Keyboard Shortcuts**: Quick activation without popup
- **Embedded UI**: Floating button in web pages

**Activation**: Via keyboard shortcuts (`Ctrl+Shift+I`, `Ctrl+Shift+S`) or floating button - NOT the extension popup.

---

## ⚠️ IMPORTANT: Package Manager & Commands

**MUST use `pnpm` - NEVER use `npm` or `yarn`**

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Chrome
pnpm dev:firefox      # Firefox

# Build
pnpm build            # Production build
pnpm zip              # Create distribution zip

# Type checking
pnpm compile          # TypeScript check

# ⚠️ ALWAYS run after changes
pnpm run check        # Check code quality
pnpm run check:i18n   # Check i18n completeness
```

**After completing any task**: Run `pnpm run check` to verify code quality.

---

## Quick Links

**📚 Full Documentation**: [docs/README.md](docs/README.md)

**Quick Start**:
- [Getting Started](docs/getting-started.md) - Setup and run locally
- [Architecture Overview](docs/architecture/overview.md) - System design

**Core Features**:
- [Image Capture](docs/architecture/image-capture.md) - Selection, screenshot, upload
- [Prompt Generation](docs/architecture/prompt-generation.md) - AI integration
- [Internationalization](docs/features/i18n.md) - Multi-language support
- [Dual Language Prompts](docs/features/dual-language.md) - EN + CN output

---

## Coding Standards & Conventions

### Core Principles

- ✅ **KISS**: Keep It Simple, Stupid
- ✅ **YAGNI**: You Aren't Gonna Need It
- Write accessible, performant, type-safe, maintainable code
- Focus on clarity and intent, not brevity

### Ultracite (Zero-Config Quality Standards)

This project uses Ultracite for automatic code formatting and linting with Biome engine.

```bash
# Format code
pnpm dlx ultracite fix

# Check for issues
pnpm dlx ultracite check

# Diagnose setup
pnpm dlx ultracite doctor
```

**Most issues are auto-fixable**. Run `pnpm dlx ultracite fix` before committing.

### Commit Message Format

Use conventional commits: `type(scope): subject`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Examples**:
```
feat(capture): add dual language prompt generation
fix(i18n): handle missing translations gracefully
docs(readme): update installation instructions
```

### Internationalization (i18n)

- ✅ Support i18n for all user-facing text
- ✅ Write business logic with EN translations only initially
- ✅ Use English for comments and console.log
- ⚠️ If `pnpm run check:i18n` fails: Add missing translations to target language files (don't copy EN)
- ⚠️ Translate into target language, never copy English versions

**Locale files location**: `public/_locales/{lang}/messages.json`

### TypeScript Best Practices

```typescript
// ✅ Use explicit types for clarity
function processImage(image: string, config: APIConfig): Promise<string>

// ✅ Prefer unknown over any
function handleError(error: unknown): void

// ✅ Use as const for immutables
const PROVIDERS = ['openai', 'anthropic'] as const

// ✅ Use type narrowing, not assertions
if (typeof error === 'string') {
  console.error(error);
}

// ✅ Use meaningful names, not magic numbers
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
```

### Modern JavaScript/TypeScript

```typescript
// ✅ Arrow functions for callbacks
const filtered = items.filter(item => item.active);

// ✅ Prefer for...of over .forEach()
for (const item of items) {
  console.log(item);
}

// ✅ Optional chaining and nullish coalescing
const value = obj?.nested?.property ?? 'default';

// ✅ Template literals
const message = `Processing ${count} images`;

// ✅ Destructuring
const { name, version } = packageInfo;

// ✅ const by default, let only when needed, never var
```

### Async & Promises

```typescript
// ✅ Always await promises
async function fetchImage(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

// ✅ Use async/await instead of chains
// ✅ Handle errors with try-catch
try {
  const result = await processData(input);
  return result;
} catch (error) {
  console.error('Processing failed:', error);
  throw error;
}

// ❌ Never use async as Promise executor
```

### React 19+ Guidelines

```tsx
// ✅ Function components only
function ImageCapture({ onSelect }: Props) {
  // ...
}

// ✅ Call hooks at top level only
const [state, setState] = useState(initialValue);

// ✅ Specify all dependencies
useEffect(() => {
  fetchData();
}, [url, config]); // All dependencies listed

// ✅ Use key with unique IDs, not array index
{items.map(item => (
  <Item key={item.id} {...item} />
))}

// ✅ Use ref as prop (React 19+)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// ❌ Don't define components inside other components
// ❌ Don't pass children as props, use JSX
```

### Accessibility

```tsx
// ✅ Semantic HTML and ARIA
<button aria-label="Select image" onClick={handleSelect}>
  <img src="icon.svg" alt="Select" />
</button>

// ✅ Form labels
<label htmlFor="api-key">API Key</label>
<input id="api-key" type="text" />

// ✅ Keyboard events with mouse events
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</button>

// ✅ Semantic elements
<nav>...</nav>
<button>...</button>
<aside>...</aside>
```

### Error Handling

```typescript
// ✅ Remove console.log, debugger, alert from production code
// ✅ Throw Error objects with descriptive messages
throw new Error('Failed to process image: format not supported');

// ✅ Meaningful try-catch blocks
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  throw error;
}

// ✅ Early returns over nested conditions
function processImage(image: string): string {
  if (!image) {
    throw new Error('Image data is required');
  }

  if (image.length > MAX_SIZE) {
    return downscale(image);
  }

  return image;
}
```

### Performance

```typescript
// ✅ Avoid spread in loops for accumulators
const result = [];
for (const item of items) {
  result.push(transform(item));
}

// ✅ Top-level regex literals
const IMAGE_PATTERN = /^data:image\/\w+;base64,/;

function isImageData(str: string): boolean {
  return IMAGE_PATTERN.test(str);
}

// ✅ Specific imports, not namespace imports
import { useState } from 'react';
// Not: import * as React from 'react';

// ✅ Avoid barrel files (index re-exporting all)
```

### Security

```typescript
// ✅ Add rel="noopener" to target="_blank" links
<a href="..." target="_blank" rel="noopener noreferrer">

// ❌ Avoid dangerouslySetInnerHTML
// ❌ Never use eval() or assign to document.cookie
// ✅ Validate and sanitize user input
```

### WXT-Specific Rules

```typescript
// ✅ Background script: ALL code inside main()
export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
});

// ✅ Content script: Use defineContentScript()
export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    // Content script logic
  },
});

// ✅ Import WXT APIs from #imports
import { storage, createShadowRootUi } from '#imports';

// ❌ Code outside main() runs at build time in Node.js
```

---

## WXT Framework Complete Guide

### Project Structure

**With `srcDir: 'src'`** (this project's configuration):

```
project/
├── src/
│   ├── entrypoints/        # Extension entry points (REQUIRED)
│   ├── components/         # Auto-imported React components
│   ├── hooks/             # Auto-imported React hooks
│   ├── composables/       # Auto-imported Vue composables
│   ├── utils/             # Auto-imported utility functions
│   ├── assets/            # CSS, images processed by WXT
│   └── app.config.ts      # Runtime configuration
├── public/                # Files copied as-is to output
├── modules/               # Local WXT modules
├── .wxt/                  # Generated TypeScript config
├── .output/               # Build output
├── wxt.config.ts          # WXT configuration
├── package.json
└── tsconfig.json
```

**Key Points**:
- `srcDir: 'src'` moves source directories into `src/`
- `public/`, `modules/`, and config files stay at root
- `entrypoints/` is REQUIRED and must be in `srcDir`

### Entrypoints

**Rules**:
- Entrypoint = single file OR directory with `index` file
- **Must be 0 or 1 levels deep** in `entrypoints/`
- Never put helper files directly in `entrypoints/`

```
✅ Correct:
src/entrypoints/
├── background.ts           # Single file
├── popup/
│   ├── index.html         # Directory entrypoint
│   ├── main.ts
│   └── style.css
├── content.ts
└── options/
    └── index.html

❌ Wrong (too deep):
src/entrypoints/youtube/content/index.ts

✅ Correct (use dot notation):
src/entrypoints/youtube.content/index.ts
```

### Background Script

**File**: `src/entrypoints/background.ts`

```typescript
// Minimal
export default defineBackground(() => {
  // ALL runtime code here
  browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
});

// With options
export default defineBackground({
  persistent: true,    // MV2 only
  type: 'module',      // Use ES modules

  include: ['chrome'], // Only in Chrome builds
  exclude: ['firefox'],

  main() {
    // CANNOT be async
    // ALL browser API calls here
    browser.runtime.onMessage.addListener((message) => {
      handleMessage(message);
    });
  },
});
```

**Critical**:
- `main()` CANNOT be `async`
- Code outside `main()` runs at build time in Node.js
- ALL runtime browser APIs must be inside `main()`

### Content Script

**File**: `src/entrypoints/content.ts`

```typescript
export default defineContentScript({
  matches: ['<all_urls>'],      // Required
  runAt: 'document_idle',        // Optional: 'document_start' | 'document_end' | 'document_idle'

  include: ['chrome'],
  exclude: ['firefox'],

  main(ctx) {
    // Content script logic
    console.log('Content script loaded');

    // Access DOM
    const element = document.querySelector('.target');

    // Inject UI
    const ui = createShadowRootUi(ctx, {
      name: 'my-ui',
      position: 'inline',
      anchor: element,
      onMount: (container) => {
        // Mount React/Vue app here
      },
    });
    ui.mount();
  },
});
```

**Content Script Context (ctx)**:
```typescript
interface ContentScriptContext {
  scriptId: string;
  testMode: boolean;
  isInvalid: boolean;
  onInvalid: Event<void>;
}
```

### HTML Pages (Popup, Options, etc.)

**File**: `src/entrypoints/popup/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Extension</title>

  <!-- Manifest options via meta tags -->
  <meta name="manifest.default_icon" content="{ 16: '/icon-16.png' }" />
  <meta name="manifest.browser_style" content="true" />
  <meta name="manifest.include" content="['chrome']" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

**Meta Tags for Manifest**:
- `manifest.default_icon` - Icon configuration
- `manifest.browser_style` - Use browser default styles
- `manifest.open_in_tab` - Open in new tab (options page)
- `manifest.include` / `manifest.exclude` - Browser targeting

### Path Aliases (Built-in)

**DO NOT add to tsconfig.json manually**:

| Alias | Resolves to | Example |
|-------|-------------|---------|
| `~` | `src/*` | `import { fn } from "~/lib/utils"` |
| `@` | `src/*` | `import { Button } from "@/components/button"` |
| `~~` | `<rootDir>/*` | `import config from "~~/wxt.config.ts"` |
| `@@` | `<rootDir>/*` | `import { data } from "@@/assets/data.json"` |

### Auto-Imports

Directories auto-imported:
- `src/components/*` - React/Vue components
- `src/composables/*` - Vue composables
- `src/hooks/*` - React/Solid hooks
- `src/utils/*` - Utility functions

**Explicit import for WXT APIs**:
```typescript
import { storage, createShadowRootUi, ContentScriptContext } from '#imports';
```

### Manifest Generation

WXT generates `manifest.json` automatically from:
- `wxt.config.ts` manifest config
- Entrypoint files and meta tags
- WXT modules
- Build hooks

**MV2/MV3 Auto-conversion**:
```typescript
// Always write in MV3 format
export default defineConfig({
  manifest: {
    action: { default_title: 'Title' },  // MV3 format
  },
});

// WXT auto-converts to MV2 when building for MV2:
// MV2 output: "browser_action": { "default_title": "Title" }
```

### Environment Variables

```bash
# .env
WXT_API_KEY=your_key_here
VITE_CUSTOM_VAR=value
```

**Access in code**:
```typescript
const apiKey = import.meta.env.WXT_API_KEY;
const mode = import.meta.env.MODE;           // 'development' | 'production'
const browser = import.meta.env.BROWSER;      // 'chrome' | 'firefox'
const isChrome = import.meta.env.CHROME;      // boolean
const manifestVersion = import.meta.env.MANIFEST_VERSION; // 2 | 3
```

### Storage API

```typescript
import { storage } from '#imports';

// Define typed storage items
const config = storage.defineItem<Config>('local:config', {
  defaultValue: { theme: 'light' },
});

// Watch for changes
storage.watch<Config>('local:config', (newValue, oldValue) => {
  console.log('Config changed:', newValue);
});

// Get/Set
const value = await config.getValue();
await config.setValue({ theme: 'dark' });

// Direct access
await storage.setItem('local:key', value);
const item = await storage.getItem('local:key');
```

### Common Patterns

**Message Passing**:
```typescript
// Background
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'CAPTURE') {
    return handleCapture(message.data);
  }
});

// Content script
const response = await browser.runtime.sendMessage({
  type: 'CAPTURE',
  data: imageData,
});
```

**Keyboard Shortcuts**:
```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    commands: {
      'capture-image': {
        suggested_key: { default: 'Ctrl+Shift+I' },
        description: 'Capture image',
      },
    },
  },
});

// background.ts
browser.commands.onCommand.addListener((command) => {
  if (command === 'capture-image') {
    // Handle shortcut
  }
});
```

### Build & Development

```bash
# Development
pnpm dev                 # Chrome MV3
pnpm dev:firefox         # Firefox

# Production
pnpm build               # Chrome MV3
pnpm build:firefox       # Firefox
pnpm build -- --mv2      # Target MV2

# Distribution
pnpm zip                 # Create .zip for Chrome Web Store
pnpm zip:firefox
```

### Testing

```typescript
import { fakeBrowser } from 'wxt/testing';

beforeEach(() => {
  fakeBrowser.reset();
});

it('should handle message', async () => {
  fakeBrowser.runtime.onMessage.trigger({ type: 'TEST' });
  // ...
});
```

### Common Gotchas

1. **Background main() cannot be async** - ALL runtime code must be inside
2. **Entrypoints too deep** - Use dot notation for subcategories
3. **Import aliases not working** - Run `pnpm install` to regenerate types
4. **Manifest not updating** - Check `wxt.config.ts` and entrypoint meta tags
5. **Hot reload not working** - Restart dev server
6. **Content script not injecting** - Check `matches` pattern in manifest

### WXT Modules

```typescript
// wxt.config.ts
export default defineConfig({
  modules: [
    '@wxt-dev/module-react',  // React support
    '@wxt-dev/module-vue',    // Vue support
  ],
});
```

### Documentation Links

- [WXT Documentation](https://wxt.dev/)
- [API Reference](https://wxt.dev/api/)
- [Guide](https://wxt.dev/guide/)
- [Examples](https://github.com/nickolay/wxt/tree/main/examples)

---

---

## shadcn/ui Guidelines

### Component Usage

This project uses **shadcn/ui** with Tailwind CSS for UI components.

```bash
# Add new components
pnpm dlx shadcn@latest add button card dialog
pnpm dlx shadcn@latest add --path src/components/ui --all

# Get component docs
pnpm dlx shadcn@latest docs button
```

### Critical Rules

#### Styling & Tailwind

- **`className` for layout, not styling.** Never override component colors or typography.
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*`.
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides.** Use semantic tokens (`bg-background`, `text-muted-foreground`).
- **Use `cn()` for conditional classes.**

```tsx
// ✅ Correct
<div className="flex flex-col gap-4">
<div className="size-10">
<span className="truncate">

// ❌ Wrong
<div className="space-y-4">
<div className="w-10 h-10">
<span className="overflow-hidden text-ellipsis whitespace-nowrap">
```

#### Forms & Inputs

- **Forms use `div` with `flex flex-col gap-*`.** Never use `div` with `space-y-*`.
- **Option sets (2–7 choices) use `RadioGroup`.**
- **Field validation uses `data-invalid` + `aria-invalid`.**

```tsx
// ✅ Correct
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" />
</div>

// ❌ Wrong
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" />
</div>
```

#### Component Structure

- **Items always inside their Group.** `SelectItem` → `SelectGroup`.
- **Dialog always need a Title.** `DialogTitle` required for accessibility.
- **Use full Card composition.** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- **Button has no `isPending`/`isLoading`.** Compose with `Spinner` + `disabled`.
- **`TabsTrigger` must be inside `TabsList`.**
- **`Avatar` always needs `AvatarFallback`.**

```tsx
// ✅ Correct
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Wrong
<Card>
  <div>Title</div>
  <div>Content</div>
</Card>
```

#### Icons

- **Icons in `Button` use `data-icon`.**
- **No sizing classes on icons inside components.**
- **Pass icons as objects, not string keys.**

```tsx
// ✅ Correct
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// ❌ Wrong
<Button>
  <SearchIcon className="w-4 h-4" />
  Search
</Button>
```

### Component Selection

| Need                       | Use                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Button/action              | `Button` with appropriate variant                                                                   |
| Form inputs                | `Input`, `Select`, `Checkbox`, `RadioGroup`, `Textarea`                                             |
| Data display               | `Card`, `Badge`, `Skeleton`                                                                         |
| Overlays                   | `Dialog` (modal), `AlertDialog` (confirmation)                                                      |
| Feedback                   | `Alert`, `Toaster` (sonner)                                                                         |
| Layout                     | `Card`, `Separator`, `Skeleton`                                                                     |

### Semantic Colors

Always use semantic color tokens instead of raw values:

```tsx
// ✅ Correct
<Button variant="primary">Submit</Button>
<Badge variant="secondary">Active</Badge>
<span className="text-muted-foreground">Subtitle</span>

// ❌ Wrong
<Button className="bg-blue-500">Submit</Button>
<Badge className="bg-green-500">Active</Badge>
<span className="text-gray-500">Subtitle</span>
```

### Adding New Components

1. Check existing components first: `ls src/components/ui/`
2. Search for components: `pnpm dlx shadcn@latest search`
3. Get documentation: `pnpm dlx shadcn@latest docs <component>`
4. Add component: `pnpm dlx shadcn@latest add <component> --path src/components/ui`

### Key Patterns

```tsx
// Icons in buttons
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*
<div className="flex flex-col gap-4">

// Equal dimensions: size-*
<Avatar className="size-10">

// Status colors: Badge variants
<Badge variant="secondary">Active</Badge>
```

---

---

## Testing Guidelines

### Test Setup

This project uses **Vitest** with WXT's first-class testing support via `WxtVitest` plugin.

```bash
# Run tests
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ui           # UI mode
pnpm test:coverage     # Coverage report
```

### WxtVitest Features

The `WxtVitest` plugin automatically:
- ✅ Polyfills `browser` API with `@webext-core/fake-browser`
- ✅ Applies all Vite config from `wxt.config.ts`
- ✅ Configures auto-imports
- ✅ Sets up global variables (`import.meta.env.BROWSER`, etc.)
- ✅ Configures path aliases (`@/`, `~/`, etc.)

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

describe('Feature', () => {
  beforeEach(() => {
    // Reset all fake browser state between tests
    fakeBrowser.reset();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Testing Best Practices

```typescript
// ✅ Write assertions in test blocks
it('should downscale large images', async () => {
  const result = await downscaleImage(largeImage, 1024);
  expect(result.width).toBeLessThanOrEqual(1024);
});

// ✅ Use async/await, not done callbacks
it('should process image', async () => {
  const result = await processImage(input);
  expect(result).toBeDefined();
});

// ✅ Reset fake browser state in beforeEach
beforeEach(() => {
  fakeBrowser.reset();
});

// ✅ Test storage operations with fakeBrowser
it('should store data', async () => {
  await browser.storage.local.set({ key: 'value' });
  const result = await browser.storage.local.get('key');
  expect(result).toEqual({ key: 'value' });
});

// ❌ Don't use .only or .skip in committed code
// ✅ Keep test structure relatively flat
// ❌ Avoid excessive describe nesting
```

### Mocking WXT APIs

Auto-imports via `#imports` are rewritten by the preprocessor. To mock a WXT utility, use the real import path:

```typescript
// Run `wxt prepare` and check `.wxt/types/imports-module.d.ts`
// to find the real import path

vi.mock('wxt/utils/inject-script', () => ({
  injectScript: vi.fn().mockResolvedValue({ script: document.createElement('script') }),
}));
```

### Test Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Watch mode (re-run on changes) |
| `pnpm test:ui` | Visual UI mode |
| `pnpm test:coverage` | Generate coverage report |

---

## Technology Stack

- **Framework**: WXT (Browser Extension)
- **Frontend**: React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **LLM SDK**: Vercel AI SDK (recommended)
- **Testing**: Vitest + WxtVitest
- **Build**: WXT/Vite
- **Package Manager**: pnpm (REQUIRED)

---

## Project Structure

```
img2prompt/
├── src/
│   ├── entrypoints/         # Background, content, popup, options
│   ├── components/          # React components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities (cn, etc.)
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles (Tailwind)
│   └── __tests__/           # Test files
├── public/
│   ├── _locales/            # i18n locale files
│   └── icon/                # Extension icons
├── docs/                    # Documentation
│   ├── architecture/        # Architecture docs
│   ├── features/            # Feature guides
│   ├── development/         # Dev guides
│   ├── deployment/          # Deployment docs
│   ├── reference/           # API reference
│   └── security/            # Security docs
└── .wxt/                    # Generated types
```

---

## Development Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Development (Chrome)
pnpm dev:firefox    # Development (Firefox)
pnpm build          # Production build
pnpm zip            # Create distribution zip
pnpm compile        # Type check
```

---

## Key Files

- `wxt.config.ts` - WXT configuration
- `src/entrypoints/background.ts` - Background script
- `src/entrypoints/content.ts` - Content script
- `docs/README.md` - Documentation index

---

## Documentation Index

### Architecture
- [Overview](docs/architecture/overview.md) - System architecture
- [Image Capture](docs/architecture/image-capture.md) - Capture methods
- [Prompt Generation](docs/architecture/prompt-generation.md) - AI integration
- [Message Passing](docs/architecture/message-passing.md) - Communication

### Features
- [Internationalization](docs/features/i18n.md) - i18n support
- [Dual Language](docs/features/dual-language.md) - Bilingual prompts
- [Configuration](docs/features/configuration.md) - Settings
- [UI Components](docs/features/ui-components.md) - Interface

### Development
- [Setup](docs/development/setup.md) - Dev environment
- [Testing](docs/development/testing.md) - Test strategies
- [Conventions](docs/development/conventions.md) - Code style
- [Debugging](docs/development/debugging.md) - Troubleshooting

### Deployment
- [Build Guide](docs/deployment/build.md) - Production builds
- [Store Submission](docs/deployment/store-submission.md) - Chrome Web Store
- [Privacy Policy](docs/deployment/privacy-policy.md) - Data handling

### Reference
- [API Integration](docs/reference/api-integration.md) - LLM SDK usage
- [Error Handling](docs/reference/error-handling.md) - Error types
- [Performance](docs/reference/performance.md) - Optimization

### Security
- [Best Practices](docs/security/best-practices.md) - Security guidelines
- [Data Privacy](docs/security/data-privacy.md) - Privacy

---

## Coding Conventions

### Import Paths
```typescript
// ✅ Use aliases
import { Button } from '@/components/ui/button';
import { apiClient } from '~/lib/api-client';

// ❌ Avoid deep relative paths
import { Button } from '../../../components/ui/button';
```

### WXT Rules
- Background scripts: ALL runtime code inside `main()`
- Content scripts: Use `defineContentScript()`
- WXT APIs: Import from `#imports`

### File Organization
- `src/entrypoints/` - Extension entry points
- `src/components/` - UI components
- `src/hooks/` - Custom hooks
- `src/lib/` - Utilities
- `src/types/` - TypeScript types

---

## Troubleshooting

**Common Issues**:
- Extension not loading → Check manifest, permissions
- Content script not running → Verify matches pattern
- API calls failing → Check API key, network
- Build errors → Clear `.wxt/` and `node_modules/`, reinstall

**Full Troubleshooting Guide**: [docs/development/debugging.md](docs/development/debugging.md)

---

## Resources

- [WXT Documentation](https://wxt.dev/)
- [WXT React Guide](https://wxt.dev/guide/essentials/react.html)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Last Updated**: 2025-09-05
**Version**: 1.0.0

**Full Documentation**: [docs/README.md](docs/README.md)