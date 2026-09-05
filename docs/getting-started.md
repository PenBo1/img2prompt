# Getting Started

Quick start guide for setting up and running the img2prompt extension.

## Prerequisites

- Node.js 18+
- pnpm (package manager)
- Chrome or Firefox browser

## Installation

```bash
# Clone repository
git clone https://github.com/PenBo1/img2prompt.git
cd img2prompt

# Install dependencies
pnpm install

# Generate WXT types
pnpm postinstall

# Start development server
pnpm dev
```

## Development

```bash
# Development (Chrome)
pnpm dev

# Development (Firefox)
pnpm dev:firefox

# Type check
pnpm compile

# Build for production
pnpm build

# Create distribution zip
pnpm zip
```

## Loading the Extension

### Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `.output/chrome-mv3-dev/`

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `.output/firefox-mv2/manifest.json`

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| WXT | Browser extension framework |
| React 19 | UI framework |
| TypeScript | Type safety |
| shadcn/ui | UI components |
| Tailwind CSS | Styling |
| Vercel AI SDK | LLM integration |
| pnpm | Package manager |

## Key Dependencies

### Core Dependencies (Installed)

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "wxt": "^0.21.3",
  "@wxt-dev/module-react": "^1.1.5"
}
```

### LLM SDK (To Install)

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
```

**Why Vercel AI SDK?**
- Unified API for multiple providers
- Built-in error handling and retries
- TypeScript-first
- Vision/image input support
- Smaller bundle size

**Alternative SDKs:**
- `openai` - Official OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `@google/generative-ai` - Gemini SDK

## Project Structure

```
img2prompt/
├── src/                    # Source directory
│   ├── entrypoints/        # Extension entry points
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── docs/                   # Documentation
├── .wxt/                   # Generated types
└── .output/                # Build output
```

## Next Steps

- [Architecture Overview](architecture/overview.md) - Understand the system design
- [Image Capture Methods](architecture/image-capture.md) - Learn about image selection
- [Prompt Generation](architecture/prompt-generation.md) - Understand AI integration
- [Internationalization](features/i18n.md) - Set up multi-language support

---

**Related**: [Setup Guide](development/setup.md) | [Testing](development/testing.md)