# Development Setup

Setting up the development environment for img2prompt.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (REQUIRED - do not use npm or yarn)
- **Browser**: Chrome 88+ or Firefox 78+

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/PenBo1/img2prompt.git
cd img2prompt
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# This also runs: pnpm postinstall (generates WXT types)
```

### 3. Verify Setup

```bash
# Check TypeScript
pnpm compile

# Start dev server
pnpm dev
```

## Development Workflow

### Start Development Server

```bash
# Chrome (default)
pnpm dev

# Firefox
pnpm dev:firefox
```

The dev server will:
- Watch for file changes
- Hot reload the extension
- Open a browser with the extension loaded
- Provide dev tools at `http://localhost:3001`

### Load Extension Manually

**Chrome**:
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `.output/chrome-mv3-dev/`

**Firefox**:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `.output/firefox-mv2/manifest.json`

## WXT-Specific Setup

### Directory Structure

WXT uses `srcDir: 'src'` configuration. All source files must be in `src/`:

```
src/
├── entrypoints/      # Extension entry points
├── components/       # React components (auto-imported)
├── hooks/           # React hooks (auto-imported)
├── lib/             # Utilities
├── types/           # TypeScript types
└── utils/           # Pure functions (auto-imported)
```

### Path Aliases

WXT provides built-in aliases (do NOT add to tsconfig.json manually):

| Alias | Resolves to | Example |
|-------|-------------|---------|
| `~` | `src/*` | `import { fn } from "~/lib/utils"` |
| `@` | `src/*` | `import { Button } from "@/components/ui/button"` |
| `~~` | `<rootDir>/*` | `import config from "~~/wxt.config.ts"` |
| `@@` | `<rootDir>/*` | `import { data } from "@@/assets/data.json"` |

### WXT Modules

The project uses `@wxt-dev/module-react`:

```typescript
// wxt.config.ts
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
});
```

## Install Additional Dependencies

### UI Components (shadcn/ui)

```bash
# Initialize shadcn
pnpm dlx shadcn@latest init

# Add components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add dropdown-menu
```

### LLM SDK

```bash
# Vercel AI SDK (recommended)
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic

# Or individual SDKs
pnpm add openai
pnpm add @anthropic-ai/sdk
```

## TypeScript Configuration

The project extends WXT's generated config:

```json
// tsconfig.json
{
  "extends": "./.wxt/tsconfig.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "jsx": "react-jsx"
  }
}
```

**Important**:
- Do NOT manually add path aliases to tsconfig.json
- Run `pnpm postinstall` to regenerate `.wxt/tsconfig.json`

## Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start dev server (Chrome) |
| `dev:firefox` | `pnpm dev:firefox` | Start dev server (Firefox) |
| `build` | `pnpm build` | Production build (Chrome) |
| `build:firefox` | `pnpm build:firefox` | Production build (Firefox) |
| `compile` | `pnpm compile` | TypeScript check |
| `zip` | `pnpm zip` | Create distribution zip |
| `postinstall` | `pnpm postinstall` | Generate WXT types |

## Environment Variables

Create `.env` for local development:

```bash
# .env
WXT_API_KEY=your_api_key_here
VITE_CUSTOM_VAR=value
```

**Usage in code**:
```typescript
const apiKey = import.meta.env.WXT_API_KEY;
```

**Important**:
- Variables must start with `WXT_` or `VITE_`
- Do NOT commit `.env` to git
- Use `.env.example` for documentation

## Browser Permissions

Required permissions (auto-configured by WXT):

```typescript
// In entrypoints
"activeTab"    // For screenshot capture
"storage"      // For saving settings
"tabs"         // For tab operations
```

## Common Issues

### Types Not Generated

```bash
# Regenerate WXT types
pnpm postinstall
```

### Hot Reload Not Working

```bash
# Restart dev server
pnpm dev
```

### Permission Denied

```bash
# Check manifest permissions
# Add to wxt.config.ts
export default defineConfig({
  manifest: {
    permissions: ['activeTab', 'storage', 'tabs'],
  },
});
```

## IDE Setup

### VS Code

Recommended extensions:
- WXT Extension Pack
- React Developer Tools
- TypeScript Hero

### WebStorm / IntelliJ

Enable TypeScript support and configure path aliases in settings.

---

**Related**: [Testing](testing.md) | [Conventions](conventions.md) | [Debugging](debugging.md)