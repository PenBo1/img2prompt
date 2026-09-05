# Testing Strategies

Comprehensive testing guide for img2prompt.

## Testing Tools

### Vitest (Recommended)

WXT provides built-in Vitest integration.

```bash
# Install Vitest
pnpm add -D vitest @vitest/ui jsdom
```

## Unit Testing

### Setup Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// test/setup.ts
import { beforeEach, afterEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

beforeEach(() => {
  fakeBrowser.reset();
});

afterEach(() => {
  fakeBrowser.reset();
});
```

### Test Examples

#### Testing Image Utilities

```typescript
// test/image-utils.test.ts
import { describe, it, expect } from 'vitest';
import { downscaleImage, compressImage } from '@/lib/image-utils';

describe('Image Utilities', () => {
  it('should downscale large images', async () => {
    const largeImage = await loadTestImage('test-large.jpg');
    const result = await downscaleImage(largeImage, 1024);
    const dimensions = getImageDimensions(result);

    expect(dimensions.width).toBeLessThanOrEqual(1024);
    expect(dimensions.height).toBeLessThanOrEqual(1024);
  });

  it('should maintain aspect ratio when downscaling', async () => {
    const image = await loadTestImage('test.jpg');
    const result = await downscaleImage(image, 512);
    const ratio = getImageAspectRatio(result);

    expect(ratio).toBeCloseTo(16/9, 1);
  });

  it('should compress images to target size', async () => {
    const image = await loadTestImage('test.jpg');
    const result = await compressImage(image, 500);

    expect(getSizeKB(result)).toBeLessThanOrEqual(500);
  });
});
```

#### Testing API Client

```typescript
// test/api-client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generatePrompt } from '@/lib/api-client';

describe('API Client', () => {
  it('should generate prompts in both languages', async () => {
    const config = createMockConfig();
    const imageData = 'base64imagedata';

    const result = await generatePrompt(imageData, config, {
      generateBoth: true,
    });

    expect(result.english).toBeDefined();
    expect(result.chinese).toBeDefined();
    expect(result.english).not.toBe(result.chinese);
  });

  it('should handle API errors', async () => {
    const config = createInvalidConfig();

    await expect(generatePrompt('data', config)).rejects.toThrow('Invalid API key');
  });
});
```

#### Testing Storage

```typescript
// test/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveConfig, loadConfig } from '@/lib/storage';
import { fakeBrowser } from 'wxt/testing';

describe('Storage', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should save and load config', async () => {
    const config = createTestConfig();

    await saveConfig(config);
    const loaded = await loadConfig();

    expect(loaded).toEqual(config);
  });

  it('should return default config when empty', async () => {
    const config = await loadConfig();

    expect(config).toEqual(getDefaultConfig());
  });
});
```

## Integration Testing

### Testing Message Flow

```typescript
// test/integration/message-flow.test.ts
import { describe, it, expect } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

describe('Message Flow', () => {
  it('should activate selection mode on keyboard shortcut', async () => {
    // Setup
    const background = await import('@/entrypoints/background');
    const tabId = 123;

    // Trigger keyboard command
    fakeBrowser.runtime.onCommand.trigger('select-image');

    // Verify message sent
    const messages = fakeBrowser.tabs.sendMessage.mock.calls;
    expect(messages[0][1].type).toBe('ACTIVATE_SELECTION');
  });

  it('should handle image capture and prompt generation', async () => {
    // Simulate full flow
    const imageData = 'testimagebase64';

    // Content script sends captured image
    fakeBrowser.runtime.sendMessage({
      type: 'IMAGE_CAPTURED',
      payload: { imageData },
    });

    // Background generates prompt
    const response = await fakeBrowser.runtime.sendMessage.lastCall;

    expect(response.prompt).toBeDefined();
    expect(response.prompt.english).toBeDefined();
    expect(response.prompt.chinese).toBeDefined();
  });
});
```

### Testing Content Script

```typescript
// test/integration/content-script.test.ts
import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Content Script', () => {
  it('should inject floating UI', () => {
    const dom = new JSDOM('<!DOCTYPE html><body></body></html>');
    global.document = dom.window.document;

    const { injectFloatingUI } = require('@/entrypoints/content');

    injectFloatingUI();

    const floatingUI = document.querySelector('#img2prompt-float-btn');
    expect(floatingUI).toBeDefined();
  });

  it('should highlight images on hover', () => {
    // Setup DOM with image
    const img = document.createElement('img');
    img.src = 'test.jpg';
    document.body.appendChild(img);

    // Trigger hover
    const event = new MouseEvent('mouseover', { target: img });
    img.dispatchEvent(event);

    // Check highlight
    const overlay = document.querySelector('.img2prompt-highlight');
    expect(overlay).toBeDefined();
  });
});
```

## WXT Testing Utilities

WXT provides `fakeBrowser` for testing extension APIs:

```typescript
import { fakeBrowser } from 'wxt/testing';

// Mock storage
fakeBrowser.storage.local.get.mockResolvedValue({ key: 'value' });

// Mock tabs
fakeBrowser.tabs.query.mockResolvedValue([{ id: 1, active: true }]);

// Mock messaging
fakeBrowser.runtime.sendMessage.mockResolvedValue({ success: true });

// Reset between tests
fakeBrowser.reset();
```

## Manual Testing Checklist

### Image Selection

```
□ Test on static images
□ Test on lazy-loaded images
□ Test on background images (CSS)
□ Test on cross-origin images
□ Test on SVG images
□ Test on canvas elements
□ Test selection highlight
□ Test exit selection mode
□ Test with different page layouts
```

### Screenshot Capture

```
□ Test full screen capture
□ Test partial selection
□ Test on high DPI screens
□ Test on scrolled pages
□ Test selection box UI
□ Test cancel screenshot
□ Test on different websites
```

### Prompt Generation

```
□ Test with different image types
□ Test English prompt generation
□ Test Chinese prompt generation
□ Test both languages
□ Test error handling
□ Test regenerate function
□ Test copy to clipboard
```

### UI/UX

```
□ Test floating button hover
□ Test all three actions
□ Test keyboard shortcuts
□ Test popup information
□ Test settings page
□ Test language switching
□ Test on different browsers (Chrome, Firefox)
```

### i18n

```
□ Test English UI
□ Test Chinese UI
□ Test language detection
□ Test language switching
□ Test missing translations
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific file
pnpm test image-utils.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## Test Commands

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Mocking Strategies

### Mock LLM API

```typescript
// test/mocks/llm-api.ts
export function mockLLMResponse(prompt: string) {
  return {
    english: 'A detailed prompt in English...',
    chinese: '一个详细的中文提示词...',
  };
}

// In test
vi.mock('@/lib/api-client', () => ({
  generatePrompt: mockLLMResponse,
}));
```

### Mock Chrome APIs

```typescript
// Already provided by WXT
fakeBrowser.storage.local.get.mockResolvedValue({ key: 'value' });
fakeBrowser.tabs.captureVisibleTab.mockResolvedValue('data:image/png;base64,...');
```

## Best Practices

1. **Test in isolation**: Use mocks for external dependencies
2. **Test real scenarios**: Don't just test implementation details
3. **Test error paths**: Not just happy path
4. **Use descriptive names**: `should downscale large images to max size`
5. **Keep tests fast**: Use unit tests for logic, integration for flows

---

**Related**: [Setup](setup.md) | [Conventions](conventions.md) | [Debugging](debugging.md)