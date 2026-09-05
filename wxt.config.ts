import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  // Development hooks
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      // Add DEV suffix to name in development mode
      if (wxt.config.mode === "development") {
        manifest.name += " (DEV)";
      }
    },
  },

  manifest: {
    // Action (popup or no popup - see note below)
    action: {
      default_icon: {
        16: "/icon/16.png",
        32: "/icon/32.png",
        48: "/icon/48.png",
        128: "/icon/128.png",
      },
    },

    // Keyboard shortcuts
    commands: {
      "capture-image": {
        description: "Capture image from current page",
        suggested_key: {
          default: "Ctrl+Shift+I",
          mac: "Command+Shift+I",
        },
      },
      "take-screenshot": {
        description: "Take screenshot of current page",
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S",
        },
      },
    },
    description:
      "Convert images to AI image generation prompts with dual language support",

    // Host permissions for API calls
    host_permissions: [
      "https://*/*", // Access to all HTTPS sites for image capture
    ],
    name: "img2prompt",

    // Permissions
    permissions: [
      "storage", // Store API keys and settings
      "activeTab", // Access current tab for image selection
      "tabs", // Tab management
      "scripting", // Inject content scripts if needed
    ],

    // Web accessible resources
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["icon/*.png", "assets/*"],
      },
    ],
  },
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
});
