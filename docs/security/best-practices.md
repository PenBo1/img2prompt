# Security Best Practices

Security guidelines for img2prompt browser extension.

## API Key Security

### Never Hardcode API Keys

```typescript
// ❌ NEVER do this
const API_KEY = 'sk-1234567890abcdef';

// ✅ Always use storage
export async function getAPIKey(): Promise<string | null> {
  const result = await browser.storage.local.get('api_key');
  return result.api_key || null;
}

export async function saveAPIKey(key: string): Promise<void> {
  await browser.storage.local.set({ api_key: key });
}
```

### Use Chrome's Encrypted Storage

```typescript
// ✅ Good - chrome.storage.local is encrypted by Chrome
await browser.storage.local.set({ api_key: key });

// ❌ Bad - localStorage is NOT encrypted
localStorage.setItem('api_key', key); // Never do this!

// ❌ Bad - sessionStorage is NOT encrypted
sessionStorage.setItem('api_key', key); // Never do this!
```

### Clear Sensitive Data on Logout

```typescript
export async function clearSensitiveData(): Promise<void> {
  await browser.storage.local.remove([
    'api_key',
    'api_endpoint',
    'temp_image',
  ]);
}
```

## Content Script Security

### Isolated World

Content scripts run in an isolated JavaScript environment:

```typescript
// ✅ Good - variables are isolated from page scripts
const apiKey = await getAPIKey();
// Page scripts cannot access apiKey

// ❌ Bad - NEVER expose sensitive data to page
window.myExtensionAPI = {
  getAPIKey: () => apiKey, // Never do this!
};
```

### Don't Trust Page Data

```typescript
// ✅ Good - validate and sanitize
const userInput = sanitizeHTML(element.textContent);

// ❌ Bad - using untrusted data
element.innerHTML = pageData; // Never do this!
```

### Use DOMPurify for HTML

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

// Sanitize HTML before insertion
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;
```

## Image Handling

### Validate Image Data

```typescript
export function validateImageData(data: string): boolean {
  // Check data URL format
  if (!data.startsWith('data:image/')) {
    return false;
  }

  // Check size (max 20MB)
  const sizeInBytes = getBase64Size(data);
  if (sizeInBytes > 20 * 1024 * 1024) {
    return false;
  }

  // Check supported formats
  const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  const format = extractFormat(data);
  if (!supportedFormats.includes(format)) {
    return false;
  }

  return true;
}
```

### Handle Cross-Origin Images

```typescript
// ✅ Good - use background script for cross-origin
async function fetchCrossOriginImage(url: string): Promise<string> {
  return await browser.runtime.sendMessage({
    type: 'FETCH_IMAGE',
    url,
  });
}

// ❌ Bad - direct fetch can fail due to CORS
const response = await fetch(url); // May fail
```

### Limit Image Size

```typescript
export async function processImageSafely(imageData: string): Promise<string> {
  // Check size
  const size = getBase64Size(imageData);
  if (size > 20 * 1024 * 1024) {
    throw new ExtensionError(
      ErrorType.IMAGE_TOO_LARGE,
      'Image exceeds 20MB limit',
      true,
      'Will be automatically downscaled'
    );
  }

  // Downscale if needed
  if (size > 5 * 1024 * 1024) {
    return await downscaleImage(imageData, 2048);
  }

  return imageData;
}
```

## Data Privacy

### User Data Control

```typescript
// Export all user data
export async function exportUserData(): Promise<string> {
  const data = await browser.storage.local.get(null);
  return JSON.stringify(data, null, 2);
}

// Clear all user data
export async function clearAllUserData(): Promise<void> {
  await browser.storage.local.clear();
}

// Delete specific data
export async function deleteUserData(keys: string[]): Promise<void> {
  await browser.storage.local.remove(keys);
}
```

### History Management

```typescript
interface HistorySettings {
  enabled: boolean;
  maxItems: number;
  autoDelete: boolean;
  retentionDays: number;
}

export async function cleanOldHistory(): Promise<void> {
  const settings = await getHistorySettings();
  const history = await getHistory();

  // Filter by retention
  const cutoff = Date.now() - (settings.retentionDays * 86400000);
  const filtered = history.filter(item => item.timestamp > cutoff);

  // Limit count
  const trimmed = filtered.slice(0, settings.maxItems);

  await saveHistory(trimmed);
}
```

### Don't Send Data to Third Parties

```typescript
// ❌ Never send data to extension developer's servers
await fetch('https://developer-server.com/api', {
  method: 'POST',
  body: JSON.stringify(userImages), // Never do this!
});

// ✅ Only send to user-configured API
const userAPIEndpoint = await getStoredEndpoint();
await fetch(userAPIEndpoint, {
  method: 'POST',
  body: JSON.stringify(imageData),
});
```

## Permission Best Practices

### Request Minimal Permissions

```json
// ✅ Good - minimal permissions
{
  "permissions": [
    "activeTab",
    "storage"
  ]
}

// ❌ Bad - excessive permissions
{
  "permissions": [
    "tabs",
    "bookmarks",
    "history",
    "cookies",
    "browsingData"
  ]
}
```

### Explain Permissions to Users

```typescript
// Show permission dialog
async function requestScreenshotPermission(): Promise<boolean> {
  const granted = await browser.permissions.request({
    permissions: ['activeTab'],
  });

  if (!granted) {
    showErrorToast(new ExtensionError(
      ErrorType.PERMISSION_DENIED,
      'Screenshot permission required',
      true,
      'Grant permission to use screenshot feature'
    ));
  }

  return granted;
}
```

### Use activeTab Instead of tabs

```json
// ✅ Good - activeTab is temporary and scoped
{
  "permissions": ["activeTab"]
}

// ❌ Bad - tabs is permanent and broad
{
  "permissions": ["tabs"]
}
```

## Secure Communication

### Validate Messages

```typescript
// background.ts
browser.runtime.onMessage.addListener((message, sender) => {
  // Validate message type
  if (!message.type || !Object.values(MessageType).includes(message.type)) {
    console.error('Invalid message type:', message.type);
    return;
  }

  // Validate sender
  if (!sender.tab || sender.id !== browser.runtime.id) {
    console.error('Invalid sender:', sender);
    return;
  }

  // Process message
  handleMessage(message);
});
```

### Don't Trust External Messages

```typescript
// ✅ Good - verify sender
browser.runtime.onMessageExternal.addListener((message, sender) => {
  // Only accept from specific extensions/websites
  const allowedOrigins = ['https://example.com'];
  if (!allowedOrigins.includes(sender.url)) {
    return;
  }

  // Process external message
});
```

## Content Security Policy

### Manifest CSP

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### No Inline Scripts

```html
<!-- ✅ Good - external script -->
<script src="popup.js"></script>

<!-- ❌ Bad - inline script -->
<script>
  console.log('popup loaded');
</script>
```

### No eval()

```typescript
// ❌ Never use eval
eval(userInput); // Never do this!

// ❌ Never use Function constructor
new Function('return ' + userInput)(); // Never do this!
```

## Update Security

### Secure Updates

```typescript
// Check for extension updates
async function checkForUpdates(): Promise<void> {
  const currentVersion = browser.runtime.getManifest().version;
  const updateInfo = await fetchUpdateInfo();

  if (updateInfo.version > currentVersion) {
    showUpdateNotification(updateInfo);
  }
}
```

### Version Validation

```typescript
export function isValidVersion(version: string): boolean {
  // Semantic versioning pattern
  const semver = /^\d+\.\d+\.\d+$/;
  return semver.test(version);
}
```

## Audit and Logging

### Log Security Events

```typescript
interface SecurityLog {
  timestamp: number;
  event: string;
  details?: any;
}

async function logSecurityEvent(event: string, details?: any): Promise<void> {
  const log: SecurityLog = {
    timestamp: Date.now(),
    event,
    details,
  };

  const logs = await browser.storage.local.get('securityLogs') || [];
  logs.push(log);

  // Keep only last 100 logs
  if (logs.length > 100) logs.shift();

  await browser.storage.local.set({ securityLogs: logs });
}

// Usage
logSecurityEvent('API_KEY_CHANGED');
logSecurityEvent('PERMISSION_GRANTED', { permission: 'activeTab' });
```

## Security Checklist

```
□ API keys stored in chrome.storage.local (encrypted)
□ No hardcoded secrets in code
□ No sensitive data exposed to page scripts
□ User input sanitized with DOMPurify
□ Cross-origin images handled safely
□ Minimal permissions requested
□ Permissions explained to users
□ No data sent to third parties
□ Content Security Policy configured
□ No eval() or Function constructor
□ Security events logged
□ User data exportable and deletable
```

---

**Related**: [Error Handling](../reference/error-handling.md) | [Privacy Policy](../deployment/privacy-policy.md)