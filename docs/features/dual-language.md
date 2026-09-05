# Dual Language Prompts

Generate prompts in both English and Chinese simultaneously.

## Overview

The extension generates prompts in both English and Chinese at the same time, allowing users to:
- Choose their preferred language for copying
- Compare nuances between languages
- Use the most appropriate prompt for their AI tool

## Architecture

```typescript
interface GeneratedPrompt {
  english: string;      // English prompt
  chinese: string;      // Chinese (Simplified) prompt
  timestamp: number;    // Generation time
  imageData: string;    // Image hash/reference
}
```

## Implementation

### Parallel Generation

Generate both languages simultaneously for optimal speed:

```typescript
// background.ts
async function generateDualLanguagePrompt(
  imageData: string,
  config: APIConfig
): Promise<GeneratedPrompt> {
  const client = createProviderClient(config);
  const model = client(config.model);

  // Run both in parallel
  const [enResult, zhResult] = await Promise.all([
    generateText({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing images and creating detailed prompts for AI image generation tools. Describe the image in detail, focusing on: subject, style, lighting, composition, colors, mood, and technical aspects.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image and create a detailed prompt.' },
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
          content: '你是一位专业的图像分析师，擅长为AI图像生成工具创建详细的提示词。请详细描述图像，重点关注：主题、风格、光照、构图、色彩、情绪和技术细节。',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '分析这张图片并创建一个详细的中文提示词。' },
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
    timestamp: Date.now(),
    imageData: imageData.substring(0, 100),
  };
}
```

## UI Display

### Tabbed Interface

```typescript
// components/PromptDisplay.tsx
function PromptDisplay({ prompt }: { prompt: GeneratedPrompt }) {
  const [activeTab, setActiveTab] = useState<'en' | 'zh'>('en');

  return (
    <div className="prompt-container">
      <div className="tabs">
        <button
          className={activeTab === 'en' ? 'active' : ''}
          onClick={() => setActiveTab('en')}
        >
          English
        </button>
        <button
          className={activeTab === 'zh' ? 'active' : ''}
          onClick={() => setActiveTab('zh')}
        >
          中文
        </button>
      </div>

      <div className="prompt-content">
        {activeTab === 'en' ? (
          <p>{prompt.english}</p>
        ) : (
          <p>{prompt.chinese}</p>
        )}
      </div>

      <div className="actions">
        <button onClick={() => copyToClipboard(prompt[activeTab])}>
          Copy {activeTab === 'en' ? 'English' : 'Chinese'} Prompt
        </button>
        <button onClick={() => copyBoth(prompt)}>
          Copy Both Languages
        </button>
        <button onClick={() => regenerate()}>
          Regenerate
        </button>
      </div>
    </div>
  );
}
```

### Copy Functions

```typescript
// Copy single language
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
}

// Copy both languages
function copyBoth(prompt: GeneratedPrompt) {
  const text = `English:\n${prompt.english}\n\n中文:\n${prompt.chinese}`;
  navigator.clipboard.writeText(text);
  showToast('Both prompts copied');
}
```

## Progress Indicator

```typescript
function DualLanguageProgress() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>
        {progress < 50
          ? 'Generating English prompt...'
          : 'Generating Chinese prompt...'}
      </p>
    </div>
  );
}
```

## Configuration

### Settings

```typescript
interface PromptSettings {
  generateBoth: boolean;        // Generate both languages
  primaryLanguage: 'en' | 'zh'; // Primary language
  autoSelect: boolean;          // Auto-select primary language
}
```

### Options UI

```typescript
function PromptSettingsForm() {
  return (
    <div>
      <label>
        <input type="checkbox" />
        Generate prompts in both English and Chinese
      </label>

      <label>
        Primary language:
        <select>
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>

      <label>
        <input type="checkbox" />
        Auto-select primary language for copying
      </label>
    </div>
  );
}
```

## Error Handling

```typescript
async function generateWithFallback(
  imageData: string,
  config: APIConfig
): Promise<GeneratedPrompt> {
  try {
    return await generateDualLanguagePrompt(imageData, config);
  } catch (error) {
    // If dual generation fails, try single language
    console.error('Dual generation failed, falling back to single language');

    const english = await generateSingleLanguagePrompt(imageData, config, 'en');

    return {
      english,
      chinese: '', // Empty if generation failed
      timestamp: Date.now(),
      imageData: imageData.substring(0, 100),
    };
  }
}
```

## Storage

### Save to History

```typescript
interface PromptHistoryItem {
  id: string;
  english: string;
  chinese: string;
  imageData: string;
  timestamp: number;
  source: 'selection' | 'screenshot' | 'upload';
}

async function saveToHistory(prompt: GeneratedPrompt, source: string) {
  const history = await browser.storage.local.get('history') || [];

  history.unshift({
    id: generateId(),
    ...prompt,
    source,
  });

  // Limit history size
  if (history.length > 100) {
    history.pop();
  }

  await browser.storage.local.set({ history });
}
```

## Best Practices

### 1. Always Generate Both

```typescript
// ✅ Good - generate both languages
const prompt = await generateDualLanguagePrompt(imageData, config);

// ❌ Bad - only one language
const prompt = await generateSingleLanguagePrompt(imageData, config, 'en');
```

### 2. Provide Clear UI

- Show both languages side-by-side or in tabs
- Clearly label each language
- Make it easy to copy either or both

### 3. Handle Failures Gracefully

```typescript
if (!prompt.chinese) {
  showToast('Chinese prompt generation failed, English available');
}
```

### 4. Consider Token Costs

- Dual generation uses ~2x tokens
- Consider letting users choose single language in settings
- Show estimated cost before generation

---

**Related**: [Prompt Generation](../architecture/prompt-generation.md) | [i18n](i18n.md) | [UI Components](ui-components.md)