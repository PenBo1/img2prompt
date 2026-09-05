/**
 * Background script - handles keyboard shortcuts, message passing, and LLM API calls
 */

import { browser, storage } from "#imports";
import { generatePrompt } from "~/lib/llm";
import type {
  ExtensionConfig,
  ExtensionMessage,
  FetchImageResponse,
  ImageCapturedPayload,
  PromptGeneratedPayload,
} from "~/types";
import { DEFAULT_CONFIG, STORAGE_KEYS } from "~/types";

export default defineBackground({
  main() {
    console.log("img2prompt background script initialized");

    // Handle keyboard shortcuts
    browser.commands.onCommand.addListener(async (command) => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) {
          console.error("No active tab found");
          return;
        }

        if (command === "capture-image") {
          console.log("Activating image selection mode");
          await browser.tabs.sendMessage(tab.id, {
            type: "ACTIVATE_SELECTION",
          });
        }

        if (command === "take-screenshot") {
          console.log("Activating screenshot mode");
          await browser.tabs.sendMessage(tab.id, {
            type: "ACTIVATE_SCREENSHOT",
          });
        }
      } catch (error) {
        console.error("Failed to handle command:", error);
      }
    });

    // Handle messages from content scripts and popup
    browser.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        // Handle async responses
        handleMessage(message, sender)
          .then((response) => {
            sendResponse(response);
          })
          .catch((error) => {
            console.error("Message handler error:", error);
            sendResponse({
              error: error instanceof Error ? error.message : "Unknown error",
            });
          });

        // Return true to indicate async response
        return true;
      }
    );
  },
});

/**
 * Handle incoming messages
 */
async function handleMessage(
  message: ExtensionMessage,
  sender: { tab?: { id?: number; windowId?: number } }
): Promise<unknown> {
  switch (message.type) {
    case "FETCH_IMAGE":
      return handleFetchImage(message.url);

    case "IMAGE_CAPTURED":
      return handleImageCaptured(message.payload as ImageCapturedPayload);

    case "GENERATE_PROMPT":
      return handleGeneratePrompt(
        message.payload.imageData,
        message.payload.language
      );

    case "CAPTURE_SCREENSHOT":
      return handleCaptureScreenshot(sender);

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

/**
 * Fetch cross-origin image
 */
async function handleFetchImage(url: string): Promise<FetchImageResponse> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ imageData: reader.result as string });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw new Error("Failed to fetch image from URL");
  }
}

/**
 * Handle captured image - store or process
 */
async function handleImageCaptured(
  payload: ImageCapturedPayload
): Promise<{ success: boolean }> {
  console.log("Image captured:", payload.source, payload.metadata);

  // Store last used for quick access
  await storage.setItem(`local:${STORAGE_KEYS.LAST_USED}`, {
    imageData: payload.imageData,
    source: payload.source,
    timestamp: payload.metadata.timestamp,
  });

  return { success: true };
}

/**
 * Generate prompt from image
 */
async function handleGeneratePrompt(
  imageData: string,
  language?: "en" | "zh" | "both"
): Promise<PromptGeneratedPayload> {
  // Get config
  const config = await storage.getItem<ExtensionConfig>(
    `local:${STORAGE_KEYS.CONFIG}`
  );
  const apiConfig = config?.apiConfig ?? DEFAULT_CONFIG.apiConfig;

  // Check API key
  if (!apiConfig.apiKey) {
    throw new Error(
      "API key not configured. Please set up your API key in the options page."
    );
  }

  // Generate prompt
  const result = await generatePrompt(imageData, apiConfig, language ?? "both");

  const payload: PromptGeneratedPayload = {
    chinesePrompt: result.chinesePrompt,
    englishPrompt: result.englishPrompt,
    source: "selection",
    timestamp: Date.now(),
  };

  // Store in history
  const history = (await storage.getItem<[]>("local:history")) ?? [];
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    ...payload,
    imageData,
  };

  await storage.setItem("local:history", [newEntry, ...history].slice(0, 50));

  return payload;
}

/**
 * Capture visible tab screenshot
 */
async function handleCaptureScreenshot(sender: {
  tab?: { id?: number; windowId?: number };
}): Promise<{ screenshot: string }> {
  try {
    const tabId = sender.tab?.id;

    if (!tabId) {
      throw new Error("No tab ID available");
    }

    // Get the window ID from the tab
    const windowId = sender.tab?.windowId;

    // Capture visible tab
    const dataUrl = await browser.tabs.captureVisibleTab(
      windowId ?? browser.windows.WINDOW_ID_CURRENT,
      {
        format: "png",
      }
    );

    return { screenshot: dataUrl };
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    throw new Error("Failed to capture screenshot");
  }
}