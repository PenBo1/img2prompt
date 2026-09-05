# Build and Deployment Guide

Complete guide to building and deploying img2prompt.

## Build Commands

### Development Build

```bash
# Chrome (default)
pnpm dev

# Firefox
pnpm dev:firefox

# Watch mode with hot reload
pnpm dev --watch
```

### Production Build

```bash
# Chrome MV3
pnpm build

# Firefox MV2/MV3
pnpm build:firefox

# Specific manifest version
pnpm build -- --mv2
pnpm build -- --mv3
```

### Distribution Package

```bash
# Create zip for Chrome Web Store
pnpm zip

# Create zip for Firefox Add-ons
pnpm zip:firefox

# Output: .output/chrome-mv3.zip or .output/firefox-mv2.zip
```

## Build Output

### Directory Structure

```
.output/
├── chrome-mv3/              # Chrome production build
│   ├── manifest.json
│   ├── background.js
│   ├── content-scripts/
│   ├── popup.html
│   ├── options.html
│   ├── chunks/
│   └── icon/
├── chrome-mv3-dev/          # Chrome development build
├── firefox-mv2/             # Firefox production build
└── firefox-mv2-dev/         # Firefox development build
```

### Build Files

| File | Description |
|------|-------------|
| `manifest.json` | Extension manifest |
| `background.js` | Background service worker |
| `content-scripts/` | Content scripts |
| `popup.html` | Popup page |
| `options.html` | Options page |
| `chunks/` | Shared code chunks |
| `icon/` | Extension icons |

## WXT Build Process

### Automatic Manifest Generation

WXT generates `manifest.json` from:
- `wxt.config.ts` configuration
- Entry point files in `src/entrypoints/`
- Module configurations

```typescript
// wxt.config.ts
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',

  manifest: {
    name: 'img2prompt',
    version: '1.0.0',
    permissions: ['activeTab', 'storage', 'tabs'],
    host_permissions: ['<all_urls>'],
    commands: {
      'select-image': {
        suggested_key: { default: 'Ctrl+Shift+I' },
        description: 'Activate image selection mode',
      },
    },
  },
});
```

### Code Splitting

WXT automatically splits code:

```javascript
// Build output
chunks/
├── vendor-react.js      // React + ReactDOM
├── vendor-ai-sdk.js     // LLM SDK
├── shared-components.js // Shared UI components
└── utils.js             // Utility functions
```

## Environment Variables

### Build-Time Variables

```bash
# .env.production
WXT_API_ENDPOINT=https://api.example.com
VITE_APP_VERSION=1.0.0
```

### Access in Code

```typescript
const endpoint = import.meta.env.WXT_API_ENDPOINT;
const version = import.meta.env.VITE_APP_VERSION;
```

### Build Modes

```bash
# Development mode
pnpm dev

# Production mode
pnpm build

# Custom mode
pnpm build -- --mode staging
```

## Browser-Specific Builds

### Chrome (MV3)

```bash
pnpm build
# Output: .output/chrome-mv3/
```

Features:
- Service worker (background.ts)
- Manifest V3
- No external requests without host_permissions

### Firefox (MV2/MV3)

```bash
pnpm build:firefox
# Output: .output/firefox-mv2/
```

Features:
- Background page or service worker
- Manifest V2 or V3
- Firefox-specific APIs

### Browser-Specific Code

```typescript
// entrypoints/background.ts
export default defineBackground({
  main() {
    if (import.meta.env.CHROME) {
      // Chrome-specific code
    } else if (import.meta.env.FIREFOX) {
      // Firefox-specific code
    }
  },
});
```

## Optimization

### Bundle Size

```typescript
// wxt.config.ts
export default defineConfig({
  vite: () => ({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ai': ['ai', '@ai-sdk/openai'],
          },
        },
      },
    },
  }),
});
```

### Tree Shaking

```typescript
// ✅ Good - tree-shakeable imports
import { Button } from '@/components/ui/button';

// ❌ Bad - imports entire library
import * as Components from '@/components/ui';
```

### Minification

WXT automatically minifies production builds:

```javascript
// Production build
background.js      // 50 KB (minified + gzipped)
background.js.map  // Source map

// Development build
background.js      // 200 KB (unminified)
```

## Source Maps

Source maps are generated automatically:

```javascript
// .output/chrome-mv3/
background.js
background.js.map
content-scripts/content.js
content-scripts/content.js.map
```

**For production**, consider disabling source maps for security:

```typescript
// wxt.config.ts
export default defineConfig({
  vite: () => ({
    build: {
      sourcemap: false,
    },
  }),
});
```

## Build Verification

### Check Manifest

```bash
# Validate manifest.json
cat .output/chrome-mv3/manifest.json

# Verify permissions
grep -A 10 '"permissions"' .output/chrome-mv3/manifest.json
```

### Test Build Locally

1. Load unpacked extension in Chrome
2. Check all features work
3. Verify no console errors
4. Test on different websites

### Bundle Analysis

```bash
# Install analyzer
pnpm add -D rollup-plugin-visualizer

// wxt.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  vite: () => ({
    plugins: [
      visualizer({ open: true }),
    ],
  }),
});
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build Extension

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build
      - run: pnpm test

      - uses: actions/upload-artifact@v3
        with:
          name: chrome-extension
          path: .output/chrome-mv3.zip
```

## Deployment Checklist

Before deploying:

```
□ Update version in package.json
□ Update CHANGELOG.md
□ Run all tests: pnpm test
□ Type check: pnpm compile
□ Build for production: pnpm build
□ Load and test in browser
□ Check bundle size
□ Verify manifest permissions
□ Create distribution zip: pnpm zip
□ Test zip package
```

---

**Related**: [Store Submission](store-submission.md) | [Privacy Policy](privacy-policy.md)