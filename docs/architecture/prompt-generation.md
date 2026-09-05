# Prompt Generation

Image-to-prompt conversion using AI vision models.

## Architecture

```
┌─────────────────┐
│  Image Input    │ (base64 / URL)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Image Preprocessing    │
│  - Resize if too large  │
│  - Convert format       │
│  - Compress if needed   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  LLM API Call           │
│  - Vision model request │
│  - System prompt config │
│  - User prompt template │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Response Processing    │
│  - Parse LLM response   │
│  - Extract prompt       │
│  - Format and clean     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Display to User        │
│  - Show in panel        │
│  - Copy to clipboard    │
│  - Save to history      │
└─────────────────────────┘
```

## LLM SDK Integration

### Install Dependencies

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
```

### Provider Configuration

```typescript
// lib/api-client.ts
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

type Provider = 'openai' | 'anthropic' | 'google' | 'custom';

interface APIConfig {
  provider: Provider;
  endpoint: string;
  apiKey: string;
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

## Basic Prompt Generation

### Single Language

```typescript
async function generateSingleLanguagePrompt(
  imageData: string,
  config: APIConfig,
  language: 'en' | 'zh'
): Promise<string> {
  const client = createProviderClient(config);
  const model = client(config.model);

  const systemPrompt = language === 'en'
    ? 'You are an expert at analyzing images and creating detailed prompts for AI image generation tools. Describe the image in detail, focusing on: subject, style, lighting, composition, colors, mood, and technical aspects.'
    : '你是一位专业的图像分析师，擅长为AI图像生成工具创建详细的提示词。请详细描述图像，重点关注：主题、风格、光照、构图、色彩、情绪和技术细节。';

  const userPrompt = language === 'en'
    ? 'Analyze this image and create a detailed prompt that could generate a similar image.'
    : '分析这张图片并创建一个详细的提示词。';

  const { text } = await generateText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image', image: `data:image/jpeg;base64,${imageData}` },
        ],
      },
    ],
    maxTokens: config.maxTokens || 1000,
    temperature: config.temperature || 0.7,
  });

  return text;
}
```

## Dual Language Generation

### Sequential (Slower but More Reliable)

```typescript
async function generateDualLanguagePrompt(
  imageData: string,
  config: APIConfig
): Promise<{ english: string; chinese: string }> {
  const [english, chinese] = await Promise.all([
    generateSingleLanguagePrompt(imageData, config, 'en'),
    generateSingleLanguagePrompt(imageData, config, 'zh'),
  ]);

  return { english, chinese };
}
```

### Parallel (Faster)

```typescript
async function generateDualLanguageParallel(
  imageData: string,
  config: APIConfig
): Promise<{ english: string; chinese: string }> {
  const client = createProviderClient(config);
  const model = client(config.model);

  const [enResult, zhResult] = await Promise.all([
    generateText({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing images. Create a detailed prompt in English.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image and create a prompt.' },
            { type: 'image', image: `data:image/jpeg;base64,${imageData}` },
          ],
        },
      ],
      maxTokens: 1000,
      temperature: 0.7,
    }),

    generateText({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的图像分析师。创建一个详细的中文提示词。',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '分析这张图片并创建提示词。' },
            { type: 'image', image: `data:image/jpeg;base64,${imageData}` },
          ],
        },
      ],
      maxTokens: 1000,
      temperature: 0.7,
    }),
  ]);

  return {
    english: enResult.text,
    chinese: zhResult.text,
  };
}
```

## Image Preprocessing

### Resize Large Images

```typescript
// lib/image-utils.ts
export async function downscaleImage(
  base64: string,
  maxSize: number = 1024
): Promise<string> {
  const img = await loadImage(base64);
  const canvas = document.createElement('canvas');

  let { width, height } = img;

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.85);
}
```

### Compress Images

```typescript
export async function compressImage(
  base64: string,
  maxSizeKB: number = 500
): Promise<string> {
  let quality = 0.9;
  let result = base64;

  while (getSizeKB(result) > maxSizeKB && quality > 0.1) {
    quality -= 0.1;
    result = await reencodeImage(base64, quality);
  }

  return result;
}

function getSizeKB(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding / 1024;
}
```

## Supported Providers

| Provider | Models | Vision Support | API Format |
|----------|--------|----------------|------------|
| OpenAI | GPT-4 Vision, GPT-4o | ✓ | OpenAI |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus | ✓ | Anthropic |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash | ✓ | OpenAI-compatible |
| OpenAI-compatible | OpenRouter, etc. | ✓ | OpenAI |
| Custom | User-defined | ✓ | OpenAI |

## Error Handling

```typescript
try {
  const prompt = await generatePrompt(imageData, config);
} catch (error) {
  if (error.status === 401) {
    throw new Error('Invalid API key');
  } else if (error.status === 429) {
    // Rate limit - retry with backoff
    await sleep(60000);
    return await generatePrompt(imageData, config);
  } else if (error.status === 413) {
    // Image too large
    const downscaled = await downscaleImage(imageData);
    return await generatePrompt(downscaled, config);
  }
  throw error;
}
```

## Background Script Integration

```typescript
// src/entrypoints/background.ts
export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      if (message.type === 'GENERATE_PROMPT') {
        try {
          const config = await getStoredConfig();
          const prompt = await generateDualLanguageParallel(
            message.imageData,
            config
          );

          return { success: true, prompt };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });
  },
});
```

---

**Related**: [Dual Language Prompts](../features/dual-language.md) | [API Integration](../reference/api-integration.md) | [Error Handling](../reference/error-handling.md)