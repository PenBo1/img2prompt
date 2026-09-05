# Chrome Web Store Submission

Guide to submitting img2prompt to the Chrome Web Store.

## Prerequisites

### Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/dev/dashboard)
2. Pay one-time registration fee ($5 USD)
3. Complete developer account setup

### Required Assets

**Icons**:
- 16x16, 32x32, 48x48, 128x128 pixels
- PNG format
- Consistent design

**Screenshots**:
- 1280x800 or 640x400 pixels
- PNG or JPEG
- At least 1 screenshot (up to 5)

**Promotional Images**:
- Small: 440x280 pixels
- Large: 1280x800 pixels (optional)
- Marquee: 1400x560 pixels (optional)

## Prepare Submission

### 1. Build Production Package

```bash
# Build and create zip
pnpm build
pnpm zip

# Output: .output/chrome-mv3.zip
```

### 2. Prepare Store Listing

**Name**: img2prompt - Image to AI Prompt

**Short Description** (132 chars max):
```
Convert images to AI generation prompts. Supports dual language (EN/CN), screenshot capture, and custom LLM APIs.
```

**Detailed Description** (16,000 chars max):
```markdown
# img2prompt - Image to AI Prompt Generator

Convert any image into detailed AI image generation prompts using advanced vision AI models.

## Features

### 🎨 Multiple Image Capture Methods
- **Image Selection**: Click to select images directly from web pages
- **Screenshot Capture**: Capture and crop screenshots
- **Drag & Drop**: Upload images by dragging or pasting

### 🌐 Dual Language Support
- Generates prompts in both English and Chinese
- Choose your preferred language for copying
- Compare nuances between languages

### ⌨️ Quick Activation
- Keyboard shortcuts: `Ctrl+Shift+I` (selection), `Ctrl+Shift+S` (screenshot)
- Floating button in web pages for instant access

### 🔧 Custom LLM Integration
- Works with OpenAI, Anthropic, Google Gemini
- Support for custom OpenAI-compatible endpoints
- Configure your own API key and settings

### 🌍 Multi-language UI
- English, Chinese (Simplified/Traditional), Japanese, Korean
- Auto-detects browser language

## How to Use

1. Press `Ctrl+Shift+I` to select an image from any web page
2. Or use the floating button in the bottom-right corner
3. The AI analyzes the image and generates detailed prompts
4. Copy the prompt in your preferred language

## Privacy & Security

- Your images are sent only to your configured LLM API
- No data sent to extension developers
- API keys stored securely in Chrome's encrypted storage
- Optional history feature you can disable

## Permissions

- `activeTab`: For screenshot capture
- `storage`: To save your settings
- `tabs`: For tab operations
- `host_permissions`: To access images on any website

## Support

- GitHub: https://github.com/PenBo1/img2prompt
- Email: support@example.com
```

**Category**: Developer Tools

**Language**: English

### 3. Privacy Policy URL

Host privacy policy on GitHub Pages or your website:

```
https://yourusername.github.io/img2prompt/privacy-policy
```

## Manifest Requirements

### Permissions

```json
{
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "contextMenus"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

**Justification**:
- `activeTab`: Required for screenshot capture without full `tabs` permission
- `storage`: Required to save user settings and history
- `tabs`: Required for capturing visible tab (screenshot)
- `host_permissions`: Required to access images on any website for selection

### Keyboard Shortcuts

```json
{
  "commands": {
    "select-image": {
      "suggested_key": {
        "default": "Ctrl+Shift+I",
        "mac": "Command+Shift+I"
      },
      "description": "Activate image selection mode"
    },
    "capture-screenshot": {
      "suggested_key": {
        "default": "Ctrl+Shift+S",
        "mac": "Command+Shift+S"
      },
      "description": "Activate screenshot mode"
    }
  }
}
```

## Submit to Chrome Web Store

### 1. Upload Package

1. Go to Developer Dashboard
2. Click "Add new item"
3. Upload `chrome-mv3.zip`
4. Wait for validation

### 2. Fill in Store Listing

1. **Store Listing**:
   - Name, short description, detailed description
   - Category, language
   - Screenshots (at least 1)
   - Small promotional image (440x280)

2. **Privacy**:
   - Add privacy policy URL
   - Declare data usage
   - Single purpose statement

3. **Pricing & Distribution**:
   - Free
   - Select countries/regions
   - No special requirements

### 3. Submit for Review

1. Review all information
2. Submit for review
3. Wait 1-3 business days

## Review Guidelines

### Common Rejection Reasons

1. **Unclear Permissions**: Not clearly explaining why permissions are needed
2. **Single Purpose**: Extension must have a single, clear purpose
3. **Remote Code**: No external scripts or code execution
4. **Deceptive Behavior**: Must not mislead users
5. **Broken Functionality**: Must work as described

### Tips for Approval

- **Clear Description**: Explain features and permissions clearly
- **Working Demo**: Ensure all features work correctly
- **Professional Assets**: High-quality screenshots and images
- **Privacy Transparency**: Clear privacy policy and data usage
- **User Control**: Allow users to disable features

## Post-Submission

### Monitor Reviews

1. Check Developer Dashboard regularly
2. Respond to user feedback
3. Fix reported issues quickly

### Update Extension

```bash
# Increment version in package.json
# 1.0.0 → 1.0.1 for bug fixes
# 1.0.0 → 1.1.0 for new features
# 1.0.0 → 2.0.0 for breaking changes

# Build new version
pnpm build
pnpm zip

# Upload to Developer Dashboard
# Submit for review
```

### Statistics

Monitor in Developer Dashboard:
- Install count
- Active users
- User ratings
- Reviews

## Firefox Add-ons

### Different Requirements

Firefox has similar but different submission process:

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Create developer account (free)
3. Upload `firefox-mv2.zip`
4. Fill in similar information

### Firefox-Specific Notes

- Manifest V2 or V3 support
- Different permission model
- Stricter content security policy
- Review process can be faster

## Alternative Distribution

### Unpacked Extension

For private distribution:

```bash
# Build
pnpm build

# Share .output/chrome-mv3/ directory
# Users load unpacked via chrome://extensions/
```

### CRX File

```bash
# Create CRX
# In chrome://extensions/
# Pack extension
```

### Enterprise Deployment

For internal distribution:
- Use Chrome Enterprise policies
- Force-install via group policy
- Host CRX on internal server

---

**Related**: [Build Guide](build.md) | [Privacy Policy](privacy-policy.md)