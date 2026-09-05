# img2prompt Documentation

Complete documentation for the img2prompt browser extension.

## Quick Navigation

### Getting Started

- **[Quick Start Guide](getting-started.md)** - Setup and run the extension locally
- **[Project Structure](architecture/project-structure.md)** - Directory layout and organization
- **[Technology Stack](getting-started.md#technology-stack)** - Frameworks and dependencies

### Architecture

- **[Architecture Overview](architecture/overview.md)** - System design and components
- **[Image Capture Methods](architecture/image-capture.md)** - Selection, screenshot, and upload
- **[Prompt Generation](architecture/prompt-generation.md)** - Image-to-prompt conversion
- **[Message Passing](architecture/message-passing.md)** - Extension communication

### Features

- **[Internationalization (i18n)](features/i18n.md)** - Multi-language support
- **[Dual Language Prompts](features/dual-language.md)** - Generate Chinese + English prompts
- **[Configuration](features/configuration.md)** - Settings and preferences
- **[UI Components](features/ui-components.md)** - Interface design and components

### Development

- **[Setup Guide](development/setup.md)** - Development environment
- **[Testing Strategies](development/testing.md)** - Unit and integration tests
- **[Coding Conventions](development/conventions.md)** - Code style and patterns
- **[Debugging Guide](development/debugging.md)** - Troubleshooting during development

### Deployment

- **[Build Guide](deployment/build.md)** - Production builds
- **[Store Submission](deployment/store-submission.md)** - Chrome Web Store requirements
- **[Privacy Policy](deployment/privacy-policy.md)** - Data handling and privacy

### Reference

- **[API Integration](reference/api-integration.md)** - LLM SDK usage
- **[Error Handling](reference/error-handling.md)** - Error types and recovery
- **[Performance Optimization](reference/performance.md)** - Speed and efficiency
- **[Security Best Practices](security/best-practices.md)** - Security guidelines

## Key Concepts

### Activation Methods

The extension does NOT use the popup icon as primary activation. Instead:

1. **Keyboard Shortcuts**: `Ctrl+Shift+I` (selection), `Ctrl+Shift+S` (screenshot)
2. **Floating Button**: Embedded in web pages, appears on hover

### Core Features

1. **Image Selection**: Select images directly from web pages
2. **Screenshot Capture**: Capture and crop screenshots
3. **Prompt Generation**: Generate prompts using AI vision models
4. **Dual Language**: Output in both English and Chinese
5. **Multi-language UI**: Support for EN, ZH, JA, KO

### Technology Stack

- **Framework**: WXT (Browser Extension)
- **Frontend**: React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **LLM SDK**: Vercel AI SDK (recommended)
- **Build**: WXT/Vite
- **Package Manager**: pnpm (required)

## Quick Links

- [AGENTS.md](../AGENTS.md) - Agent instruction file
- [package.json](../package.json) - Dependencies and scripts
- [wxt.config.ts](../wxt.config.ts) - WXT configuration

---

**Last Updated**: 2025-09-05