# Message Passing Architecture

Extension communication architecture for img2prompt.

## Message Types

```typescript
// types/messages.ts

// Activation Messages
type ActivationMessageType =
  | 'ACTIVATE_SELECTION'     // Activate image selection mode
  | 'ACTIVATE_SCREENSHOT';   // Activate screenshot mode

// Data Messages
type DataMessageType =
  | 'IMAGE_CAPTURED'         // Image captured from page
  | 'GENERATE_PROMPT'        // Request prompt generation
  | 'PROMPT_GENERATED';      // Prompt generation result

// Configuration Messages
type ConfigMessageType =
  | 'GET_CONFIG'             // Get stored configuration
  | 'UPDATE_CONFIG'          // Update configuration
  | 'TEST_API_CONNECTION';   // Test API connection

// History Messages
type HistoryMessageType =
  | 'GET_HISTORY'            // Get prompt history
  | 'CLEAR_HISTORY'          // Clear all history
  | 'DELETE_HISTORY_ITEM';   // Delete specific item

// All message types
type MessageType = ActivationMessageType | DataMessageType | ConfigMessageType | HistoryMessageType;

// Base message interface
interface Message<T = any> {
  type: MessageType;
  payload?: T;
  tabId?: number;
}
```

## Message Payloads

### Image Captured

```typescript
interface ImageCapturedMessage {
  type: 'IMAGE_CAPTURED';
  payload: {
    imageData: string;      // Base64 image data
    source: 'selection' | 'screenshot' | 'upload';
    metadata: {
      url?: string;         // Source URL if selection
      dimensions: {
        width: number;
        height: number;
      };
      timestamp: number;
    };
  };
}
```

### Generate Prompt

```typescript
interface GeneratePromptMessage {
  type: 'GENERATE_PROMPT';
  payload: {
    imageData: string;
    config?: Partial<APIConfig>; // Optional config override
  };
}
```

### Prompt Generated

```typescript
interface PromptGeneratedMessage {
  type: 'PROMPT_GENERATED';
  payload: {
    english: string;
    chinese: string;
    timestamp: number;
    processingTime: number;
  };
}
```

## Message Flow

### Image Selection Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Keyboard │         │ Content  │         │Background│
│/Floating │         │          │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ (Ctrl+Shift+I or   │                    │
     │  button click)     │                    │
     │                    │                    │
     │ ACTIVATE_SELECTION │                    │
     │────────────────────>                    │
     │                    │                    │
     │                    │ Start selection    │
     │                    │ mode               │
     │                    │                    │
     │                    │ User clicks image  │
     │                    │                    │
     │                    │ IMAGE_CAPTURED     │
     │                    │────────────────────>│
     │                    │                    │
     │                    │                    │ Store temp image
     │                    │                    │ Call LLM API
     │                    │                    │
     │                    │ PROMPT_GENERATED   │
     │                    │<────────────────────│
     │                    │                    │
     │                    │ Display prompt     │
     │                    │ in panel           │
```

### Screenshot Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Keyboard │         │ Content  │         │Background│
│/Floating │         │          │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ ACTIVATE_SCREENSHOT│                    │
     │────────────────────>                    │
     │                    │                    │
     │                    │ Request screenshot │
     │                    │────────────────────>│
     │                    │                    │
     │                    │                    │ Capture tab
     │                    │                    │
     │                    │ SCREENSHOT_DATA    │
     │                    │<────────────────────│
     │                    │                    │
     │                    │ Show selection UI  │
     │                    │                    │
     │                    │ User selects area  │
     │                    │                    │
     │                    │ IMAGE_CAPTURED     │
     │                    │────────────────────>│
     │                    │                    │
     │                    │                    │ Generate prompt
     │                    │                    │
     │                    │ PROMPT_GENERATED   │
     │                    │<────────────────────│
```

## Background Script Handler

```typescript
// src/entrypoints/background.ts
export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message, sender)
        .then(sendResponse)
        .catch(error => {
          console.error('Message handler error:', error);
          sendResponse({ error: error.message });
        });

      // Return true for async response
      return true;
    });
  },
});

async function handleMessage(
  message: Message,
  sender: Runtime.MessageSender
): Promise<any> {
  switch (message.type) {
    case 'ACTIVATE_SELECTION':
      return await activateSelectionMode(sender.tab!.id!);

    case 'ACTIVATE_SCREENSHOT':
      return await activateScreenshotMode(sender.tab!.id!);

    case 'IMAGE_CAPTURED':
      return await handleImageCaptured(message.payload);

    case 'GENERATE_PROMPT':
      return await handleGeneratePrompt(message.payload);

    case 'GET_CONFIG':
      return await getConfig();

    case 'UPDATE_CONFIG':
      return await updateConfig(message.payload);

    case 'GET_HISTORY':
      return await getHistory();

    case 'CLEAR_HISTORY':
      return await clearHistory();

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}
```

## Content Script Sender

```typescript
// src/entrypoints/content.ts

// Send to background
async function sendToBackground<T>(message: Message): Promise<T> {
  return await browser.runtime.sendMessage(message);
}

// Activate selection mode
async function activateSelection(): Promise<void> {
  await sendToBackground({
    type: 'ACTIVATE_SELECTION',
  });
}

// Send captured image
async function sendCapturedImage(
  imageData: string,
  source: 'selection' | 'screenshot' | 'upload'
): Promise<void> {
  await sendToBackground({
    type: 'IMAGE_CAPTURED',
    payload: {
      imageData,
      source,
      metadata: {
        url: window.location.href,
        dimensions: getImageDimensions(imageData),
        timestamp: Date.now(),
      },
    },
  });
}

// Request prompt generation
async function requestPromptGeneration(
  imageData: string
): Promise<{ english: string; chinese: string }> {
  return await sendToBackground({
    type: 'GENERATE_PROMPT',
    payload: { imageData },
  });
}
```

## Keyboard Shortcut Handler

```typescript
// background.ts
export default defineBackground({
  main() {
    browser.commands.onCommand.addListener(async (command) => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

      if (command === 'select-image') {
        await browser.tabs.sendMessage(tab.id!, {
          type: 'ACTIVATE_SELECTION',
        });
      } else if (command === 'capture-screenshot') {
        await activateScreenshotMode(tab.id!);
      }
    });
  },
});
```

## Long-Running Operations

For operations that take time (LLM API calls):

```typescript
// Use progress messages
interface ProgressMessage {
  type: 'GENERATION_PROGRESS';
  payload: {
    stage: 'downloading' | 'processing' | 'generating';
    progress: number; // 0-100
  };
}

// Send progress updates
async function generatePromptWithProgress(imageData: string) {
  // Send progress updates
  await sendProgress('processing', 0);

  const downscaled = await downscaleImage(imageData);
  await sendProgress('processing', 50);

  const prompt = await callLLMAPI(downscaled);
  await sendProgress('generating', 100);

  return prompt;
}

function sendProgress(stage: string, progress: number) {
  browser.runtime.sendMessage({
    type: 'GENERATION_PROGRESS',
    payload: { stage, progress },
  });
}
```

## Error Handling

```typescript
// Always handle errors
try {
  const result = await sendToBackground({ type: 'GENERATE_PROMPT', payload });
  return result;
} catch (error) {
  if (error.message.includes('Invalid API key')) {
    showError('Please check your API key in settings');
  } else if (error.message.includes('Rate limit')) {
    showError('Too many requests. Please wait a moment.');
  } else {
    showError('An error occurred. Please try again.');
  }
}
```

## Type Safety

```typescript
// Use typed message handlers
type MessageHandler<T = any, R = any> = (
  payload: T,
  sender: Runtime.MessageSender
) => Promise<R>;

const handlers: Record<MessageType, MessageHandler> = {
  ACTIVATE_SELECTION: async (payload, sender) => { ... },
  IMAGE_CAPTURED: async (payload, sender) => { ... },
  // ...
};
```

---

**Related**: [Architecture Overview](overview.md) | [Image Capture](image-capture.md) | [Prompt Generation](prompt-generation.md)