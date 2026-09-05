# Architecture Overview

System design and component architecture for img2prompt.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser Extension                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Popup UI   │  │ Options Page │  │ Content   │ │
│  │  (Minimal)   │  │  (Settings)  │  │  Script   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                  │                │        │
│         └──────────────────┴────────────────┘        │
│                            │                         │
│                    ┌───────▼────────┐               │
│                    │    Background   │               │
│                    │    Service      │               │
│                    │    Worker       │               │
│                    └───────┬────────┘               │
│                            │                         │
│         ┌──────────────────┼──────────────────┐     │
│         │                  │                  │     │
│    ┌────▼────┐      ┌─────▼──────┐     ┌────▼────┐│
│    │ Chrome  │      │   Storage  │     │   LLM   ││
│    │   API   │      │    API     │     │   API   ││
│    └─────────┘      └────────────┘     └─────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Core Components

### 1. Content Script

**File**: `src/entrypoints/content.ts`

**Responsibilities**:
- Inject floating UI into web pages
- Handle image selection mode
- Manage screenshot capture
- Display embedded panel
- Communicate with background script

**Key Features**:
- Runs on all URLs (`<all_urls>`)
- Isolated from page scripts
- Can access DOM and page images
- Injects shadow DOM UI

### 2. Background Script

**File**: `src/entrypoints/background.ts`

**Responsibilities**:
- Handle keyboard shortcuts
- Process API requests to LLM services
- Manage extension state
- Coordinate between components
- Handle image capture (tabs API)

**Key Features**:
- Service worker (MV3)
- Handles cross-origin requests
- Persists state and configuration
- Processes image data

### 3. Popup

**File**: `src/entrypoints/popup/`

**Responsibilities**:
- Display extension information
- Show keyboard shortcuts
- Link to settings page
- Minimal UI (not primary interface)

**Key Features**:
- Small and lightweight
- Shows version and status
- Quick access to settings

### 4. Options Page

**File**: `src/entrypoints/options/`

**Responsibilities**:
- Configure API settings
- Set language preferences
- Customize prompt templates
- Manage history and storage

**Key Features**:
- Full-featured settings UI
- Tabbed interface
- Test API connection
- Export/import settings

## Data Flow

```
User Action
    │
    ▼
┌─────────────────┐
│ Content Script  │  ← Handles user interaction
└────────┬────────┘
         │
         │ Message: IMAGE_CAPTURED
         ▼
┌─────────────────┐
│ Background      │  ← Processes request
│ Service Worker  │
└────────┬────────┘
         │
         │ API Call to LLM
         ▼
┌─────────────────┐
│ LLM Provider    │  ← Generates prompt
└────────┬────────┘
         │
         │ Response: PROMPT_GENERATED
         ▼
┌─────────────────┐
│ Content Script  │  ← Displays result
└─────────────────┘
```

## Activation Methods

**Primary Methods** (not popup icon):

1. **Keyboard Shortcuts**
   - `Ctrl+Shift+I`: Image selection mode
   - `Ctrl+Shift+S`: Screenshot capture mode

2. **Floating Button**
   - Embedded in web pages
   - Shows 3 actions on hover
   - Positioned bottom-right

## Key Design Decisions

### Why Embedded UI?

- **Instant access**: No need to open popup
- **Better UX**: Actions available directly on page
- **Context-aware**: Can see the page while selecting

### Why Dual Language?

- **Wider audience**: English and Chinese speakers
- **Better prompts**: Different languages capture different nuances
- **User preference**: Choose preferred output

### Why Vercel AI SDK?

- **Unified API**: Works with multiple providers
- **Type safety**: Full TypeScript support
- **Better DX**: Easier to maintain and test
- **Bundle size**: Smaller than multiple SDKs

## Component Communication

See [Message Passing](message-passing.md) for details on inter-component communication.

---

**Related**: [Image Capture](image-capture.md) | [Prompt Generation](prompt-generation.md) | [Message Passing](message-passing.md)