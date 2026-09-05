# API Integration

LLM SDK integration guide for img2prompt.

## Recommended SDK: Vercel AI SDK

### Why Vercel AI SDK?

- ✅ Unified API for multiple providers
- ✅ Built-in error handling and retry logic
- ✅ TypeScript-first with excellent type safety
- ✅ Native vision/image input support
- ✅ Smaller bundle size than multiple SDKs
- ✅ Streaming support (optional)
- ✅ Active development and good documentation

### Installation

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
```

## Provider Configuration

### OpenAI

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // or from storage
  baseURL: 'https://api.openai.com/v1', // optional, default
});

const model = openai('gpt-4o'); // or gpt-4-vision-preview
```

### Anthropic

```typescript
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com', // optional
});

const model = anthropic('claude-3-5-sonnet-20241022');
```

### Custom OpenAI-Compatible

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const customProvider = createOpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-api-endpoint.com/v1',
});

const model = customProvider('your-model-name');
```

## Vision/Image Input

### Basic Image Prompt

```typescript
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image' },
        { type: 'image', image: 'data:image/jpeg;base64,...' },
      ],
    },
  ],
});
```

### With System Prompt

```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  system: 'You are an expert at analyzing images and creating detailed prompts for AI image generation.',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Create a prompt for this image' },
        { type: 'image', image: imageData },
      ],
    },
  ],
  maxTokens: 1000,
  temperature: 0.7,
});
```

## Provider Factory Pattern

```typescript
// lib/api-client.ts
type Provider = 'openai' | 'anthropic' | 'custom';

interface APIConfig {
  provider: Provider;
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

function createProviderClient(config: APIConfig) {
  switch (config.provider) {
    case 'openai':
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint,
      });

    case 'anthropic':
      return createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.endpoint,
      });

    default:
      // Custom OpenAI-compatible endpoint
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint,
      });
  }
}
```

## Error Handling

### Typed Errors

```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Handle specific errors
try {
  const { text } = await generateText({ ... });
} catch (error: any) {
  if (error.status === 401) {
    throw new APIError(401, 'INVALID_API_KEY', 'Invalid API key');
  } else if (error.status === 429) {
    throw new APIError(429, 'RATE_LIMIT', 'Rate limit exceeded');
  } else if (error.status === 413) {
    throw new APIError(413, 'IMAGE_TOO_LARGE', 'Image too large');
  }
  throw error;
}
```

### Retry with Backoff

```typescript
async function generateWithRetry(
  params: GenerateTextParams,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { text } = await generateText(params);
      return text;
    } catch (error: any) {
      lastError = error;

      // Only retry on rate limit or network errors
      if (error.status === 429 || error.code === 'ECONNRESET') {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await sleep(delay);
        continue;
      }

      throw error; // Don't retry other errors
    }
  }

  throw lastError;
}
```

## Streaming (Optional)

```typescript
import { streamText } from 'ai';

const stream = await streamText({
  model: openai('gpt-4o'),
  messages: [ ... ],
});

for await (const textPart of stream.textStream) {
  console.log(textPart); // Real-time chunks
}

const fullText = await stream.text;
```

## Cost Estimation

```typescript
// Approximate token counting
function estimateTokens(imageData: string): number {
  // Base tokens for image (varies by model)
  const baseImageTokens = 85; // For low detail
  const highDetailTokens = 1105; // For high detail

  // Text tokens (roughly 4 chars per token)
  const textTokens = Math.ceil(promptText.length / 4);

  return baseImageTokens + textTokens;
}

// Cost calculation (OpenAI GPT-4 Vision example)
function estimateCost(tokens: number): number {
  const costPer1kTokens = 0.01; // $0.01 per 1K tokens (example)
  return (tokens / 1000) * costPer1kTokens;
}
```

## Caching

```typescript
const cache = new Map<string, { prompt: string; timestamp: number }>();

async function generateWithCache(
  imageData: string,
  config: APIConfig
): Promise<string> {
  const hash = hashImage(imageData);

  // Check cache (24 hour TTL)
  const cached = cache.get(hash);
  if (cached && Date.now() - cached.timestamp < 86400000) {
    return cached.prompt;
  }

  // Generate new
  const prompt = await generatePrompt(imageData, config);

  // Cache result
  cache.set(hash, { prompt, timestamp: Date.now() });

  // Limit cache size
  if (cache.size > 100) {
    const oldest = [...cache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    cache.delete(oldest[0]);
  }

  return prompt;
}
```

## Alternative SDKs

### Official OpenAI SDK

```bash
pnpm add openai
```

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: '...' });

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: '...' },
        { type: 'image_url', image_url: { url: 'data:...' } },
      ],
    },
  ],
});
```

### Official Anthropic SDK

```bash
pnpm add @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: '...' });

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: '...' },
        { type: 'image', source: { type: 'base64', data: '...' } },
      ],
    },
  ],
});
```

## Best Practices

1. **Use Vercel AI SDK**: Unified API across providers
2. **Implement error handling**: Catch and handle API errors gracefully
3. **Add retry logic**: For transient failures
4. **Cache results**: Avoid duplicate API calls
5. **Estimate costs**: Show users approximate costs
6. **Validate inputs**: Check image size and format before sending
7. **Use streaming**: For better UX (optional)

---

**Related**: [Prompt Generation](../architecture/prompt-generation.md) | [Error Handling](error-handling.md) | [Dual Language](../features/dual-language.md)