# Image Capture Methods

Complete guide to the three image capture methods in img2prompt.

## Overview

The extension provides three ways to capture images:
1. **Image Selection** - Select images from web pages
2. **Screenshot Capture** - Capture and crop screenshots
3. **Drag & Drop** - Upload images directly

## Activation

**Primary Methods**:
- Keyboard shortcuts (recommended)
- Floating button in web pages

**NOT** via extension popup icon.

---

## Method A: Image Selection

### Process Flow

```
User triggers selection mode
    │
    ├─ Keyboard: Ctrl+Shift+I
    └─ Floating Button: Click "Selection Mode"
         │
         ▼
    Content script activates
         │
         ▼
    Hover over page elements
         │
         ▼
    Highlight candidate images
         │
         ▼
    Click to select image
         │
         ▼
    Extract image data
         │
         ├─ Remote image → fetch & base64
         ├─ Data URL → use directly
         └─ Background image → extract from CSS
         │
         ▼
    Send to background script
         │
         ▼
    Display result in panel
```

### Implementation

```typescript
// content.ts - Image Selection Mode

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    let selectionMode = false;
    let overlay: HTMLElement | null = null;

    // Listen for activation
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'ACTIVATE_SELECTION') {
        startSelectionMode();
      }
    });

    function startSelectionMode() {
      selectionMode = true;

      // Add hover listener
      document.addEventListener('mouseover', handleHover);
      document.addEventListener('mouseout', handleOut);
      document.addEventListener('click', handleClick, true);

      // Show cursor
      document.body.style.cursor = 'crosshair';
    }

    function handleHover(e: MouseEvent) {
      const target = e.target as HTMLElement;

      // Check if it's an image
      if (target.tagName === 'IMG' || hasBackgroundImage(target)) {
        // Create highlight overlay
        showHighlightOverlay(target);
      }
    }

    async function handleClick(e: MouseEvent) {
      if (!selectionMode) return;

      const target = e.target as HTMLElement;
      e.preventDefault();
      e.stopPropagation();

      // Extract image data
      const imageData = await extractImage(target);

      // Send to background
      browser.runtime.sendMessage({
        type: 'IMAGE_CAPTURED',
        payload: {
          imageData,
          source: 'selection',
          metadata: {
            url: window.location.href,
            dimensions: getImageDimensions(target),
            timestamp: Date.now(),
          },
        },
      });

      // Exit selection mode
      exitSelectionMode();
    }
  },
});
```

### Technical Considerations

**Cross-Origin Images**:
```typescript
// Use background script to fetch
async function fetchCrossOriginImage(url: string): Promise<string> {
  const response = await browser.runtime.sendMessage({
    type: 'FETCH_IMAGE',
    url,
  });
  return response.imageData;
}

// Or use canvas with CORS
async function fetchWithCORS(url: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/jpeg');
}
```

**Background Images**:
```typescript
function extractBackgroundImage(element: HTMLElement): string | null {
  const style = window.getComputedStyle(element);
  const bgImage = style.backgroundImage;

  // Extract URL from "url(...)"
  const match = bgImage.match(/url\(['"]?(.+?)['"]?\)/);
  return match ? match[1] : null;
}
```

**Lazy-Loaded Images**:
```typescript
// Force load lazy images
function loadLazyImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete) {
      resolve();
      return;
    }

    img.addEventListener('load', () => resolve());
    img.addEventListener('error', () => resolve());

    // Trigger loading
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }
  });
}
```

---

## Method B: Screenshot Capture

### Process Flow

```
User triggers screenshot mode
    │
    ├─ Keyboard: Ctrl+Shift+S
    └─ Floating Button: Click "Screenshot Mode"
         │
         ▼
    Background script captures tab
         │
         ▼
    Content script injects overlay
         │
         ├─ Dark mask
         ├─ Selection box
         └─ Dimensions display
         │
         ▼
    User drags to select region
         │
         ▼
    Crop screenshot to selection
         │
         ▼
    Convert to base64
         │
         ▼
    Send to background script
         │
         ▼
    Display result in panel
```

### Implementation

```typescript
// background.ts
export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      if (message.type === 'ACTIVATE_SCREENSHOT') {
        // Capture visible tab
        const dataUrl = await browser.tabs.captureVisibleTab(null, {
          format: 'png',
        });

        // Send to content script
        await browser.tabs.sendMessage(sender.tab!.id!, {
          type: 'SCREENSHOT_CAPTURED',
          screenshot: dataUrl,
        });
      }
    });
  },
});

// content.ts
function showScreenshotUI(screenshot: string) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div class="screenshot-mask">
      <img src="${screenshot}" class="screenshot-preview" />
      <div class="selection-box"></div>
      <div class="dimensions">0 x 0</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Handle drag selection
  let startX, startY, endX, endY;

  overlay.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });

  overlay.addEventListener('mousemove', (e) => {
    if (startX === undefined) return;

    endX = e.clientX;
    endY = e.clientY;

    // Update selection box
    updateSelectionBox(startX, startY, endX, endY);
    updateDimensions(startX, startY, endX, endY);
  });

  overlay.addEventListener('mouseup', async () => {
    const cropped = await cropScreenshot(
      screenshot,
      startX,
      startY,
      endX,
      endY
    );

    // Send to background
    browser.runtime.sendMessage({
      type: 'IMAGE_CAPTURED',
      payload: {
        imageData: cropped,
        source: 'screenshot',
        metadata: {
          dimensions: { width: endX - startX, height: endY - startY },
          timestamp: Date.now(),
        },
      },
    });

    // Remove overlay
    overlay.remove();
  });
}

async function cropScreenshot(
  screenshot: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  const img = new Image();
  img.src = screenshot;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Handle high DPI
  const dpr = window.devicePixelRatio;
  ctx.drawImage(
    img,
    x * dpr,
    y * dpr,
    width * dpr,
    height * dpr,
    0,
    0,
    width,
    height
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}
```

### Technical Considerations

**High DPI Screens**:
```typescript
// Account for devicePixelRatio
const dpr = window.devicePixelRatio;
const canvasWidth = selectionWidth * dpr;
const canvasHeight = selectionHeight * dpr;
```

**Scroll Position**:
```typescript
// Capture includes scroll offset
const scrollX = window.scrollX;
const scrollY = window.scrollY;
```

**Permissions**:
- `activeTab` - Required for captureVisibleTab
- `tabs` - Alternative permission

---

## Method C: Drag & Drop

### Implementation

```typescript
// popup/App.tsx
function DropZone() {
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        browser.runtime.sendMessage({
          type: 'IMAGE_CAPTURED',
          payload: {
            imageData: base64,
            source: 'upload',
            metadata: {
              filename: file.name,
              timestamp: Date.now(),
            },
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;

    for (const item of items || []) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        // Same as above
      }
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      className="drop-zone"
    >
      Drop image here or paste (Ctrl+V)
    </div>
  );
}
```

---

## Error Handling

```typescript
try {
  const imageData = await extractImage(element);
  // Process
} catch (error) {
  if (error.name === 'SecurityError') {
    // Canvas tainted by cross-origin image
    showToast('Cannot capture cross-origin image directly');
  } else if (error.message.includes('too large')) {
    // Image too large
    showToast('Image too large, will be downscaled');
    const downscaled = await downscaleImage(imageData);
  }
}
```

---

**Related**: [Prompt Generation](prompt-generation.md) | [Message Passing](message-passing.md) | [UI Components](../features/ui-components.md)