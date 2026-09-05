/**
 * Content script - handles image capture and UI injection
 */

import { createShadowRootUi } from "#imports";
import type { ExtensionMessage, ImageCapturedPayload } from "~/types";

export default defineContentScript({
  main(ctx) {
    console.log("img2prompt content script loaded");

    // State
    let selectionMode = false;
    let overlay: HTMLElement | null = null;
    let highlightOverlay: HTMLElement | null = null;
    let uiContainer: HTMLElement | null = null;

    // Create floating button UI
    createUI();

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
      switch (message.type) {
        case "ACTIVATE_SELECTION":
          startImageSelection();
          break;

        case "ACTIVATE_SCREENSHOT":
          startScreenshotCapture();
          break;

        case "SHOW_PANEL":
          // Panel will be shown automatically when prompt is generated
          break;
      }
    });

    /**
     * Create floating button UI with shadow DOM
     */
    async function createUI() {
      // Create container
      uiContainer = document.createElement("div");
      uiContainer.id = "img2prompt-ui";
      document.body.appendChild(uiContainer);

      // Create shadow DOM UI
      const ui = await createShadowRootUi(ctx, {
        anchor: uiContainer,
        name: "img2prompt",
        onMount: (container) => {
          // Mount React app here
          mountReactApp(container);
        },
        position: "inline",
      });

      await ui.mount();
    }

    /**
     * Mount React app (placeholder - will use actual React)
     */
    function mountReactApp(container: Element) {
      // Create floating button
      const button = document.createElement("button");
      button.innerHTML = "📷";
      button.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #0070f3;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);
        z-index: 2147483647;
        transition: transform 0.2s;
      `;

      button.addEventListener("mouseenter", () => {
        button.style.transform = "scale(1.1)";
        showExpandedMenu(container);
      });

      button.addEventListener("click", () => {
        showExpandedMenu(container);
      });

      container.appendChild(button);
    }

    /**
     * Show expanded menu with options
     */
    function showExpandedMenu(container: Element) {
      // Remove existing menu if any
      const existingMenu = container.querySelector(".img2prompt-menu");
      if (existingMenu) {
        return;
      }

      const menu = document.createElement("div");
      menu.className = "img2prompt-menu";
      menu.style.cssText = `
        position: fixed;
        bottom: 96px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2147483647;
      `;

      // Image selection button
      const selectBtn = createMenuButton("🖼️", "Select image", () => {
        startImageSelection();
        menu.remove();
      });

      // Screenshot button
      const screenshotBtn = createMenuButton("📸", "Take screenshot", () => {
        startScreenshotCapture();
        menu.remove();
      });

      // Close button
      const closeBtn = createMenuButton("✖️", "Close", () => {
        menu.remove();
      });

      menu.appendChild(selectBtn);
      menu.appendChild(screenshotBtn);
      menu.appendChild(closeBtn);
      container.appendChild(menu);

      // Remove on mouse leave
      setTimeout(() => {
        container.addEventListener(
          "mouseleave",
          () => {
            setTimeout(() => {
              if (!container.matches(":hover")) {
                menu.remove();
              }
            }, 500);
          },
          { once: true }
        );
      }, 100);
    }

    /**
     * Create menu button
     */
    function createMenuButton(
      icon: string,
      label: string,
      onClick: () => void
    ): HTMLButtonElement {
      const btn = document.createElement("button");
      btn.innerHTML = `${icon} ${label}`;
      btn.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        background: white;
        color: #333;
        border: 1px solid #e0e0e0;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        white-space: nowrap;
      `;

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "#f0f0f0";
      });

      btn.addEventListener("click", onClick);

      return btn;
    }

    /**
     * Start image selection mode
     */
    function startImageSelection() {
      selectionMode = true;
      document.body.style.cursor = "crosshair";

      // Add event listeners
      document.addEventListener("mouseover", handleHover);
      document.addEventListener("mouseout", handleOut);
      document.addEventListener("click", handleImageClick, true);

      console.log("Image selection mode activated");
    }

    /**
     * Exit image selection mode
     */
    function exitImageSelection() {
      selectionMode = false;
      document.body.style.cursor = "";

      // Remove event listeners
      document.removeEventListener("mouseover", handleHover);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("click", handleImageClick, true);

      // Remove highlight overlay
      if (highlightOverlay) {
        highlightOverlay.remove();
        highlightOverlay = null;
      }

      console.log("Image selection mode deactivated");
    }

    /**
     * Handle hover over elements
     */
    function handleHover(e: MouseEvent) {
      if (!selectionMode) {
        return;
      }

      const target = e.target as HTMLElement;

      // Check if it's an image or has background image
      if (target.tagName === "IMG" || hasBackgroundImage(target)) {
        showHighlight(target);
      }
    }

    /**
     * Handle mouse out
     */
    function handleOut() {
      if (highlightOverlay) {
        highlightOverlay.style.display = "none";
      }
    }

    /**
     * Handle image click
     */
    async function handleImageClick(e: MouseEvent) {
      if (!selectionMode) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;

      try {
        // Extract image data
        const imageData = await extractImage(target);

        // Send to background
        const payload: ImageCapturedPayload = {
          imageData,
          metadata: {
            alt: target instanceof HTMLImageElement ? target.alt : undefined,
            dimensions: getImageDimensions(target),
            timestamp: Date.now(),
            url: window.location.href,
          },
          source: "selection",
        };

        await browser.runtime.sendMessage({
          payload,
          type: "IMAGE_CAPTURED",
        });

        // Generate prompt
        await browser.runtime.sendMessage({
          payload: {
            imageData,
            language: "both",
          },
          type: "GENERATE_PROMPT",
        });

        exitImageSelection();
      } catch (error) {
        console.error("Failed to capture image:", error);
        exitImageSelection();
      }
    }

    /**
     * Check if element has background image
     */
    function hasBackgroundImage(element: HTMLElement): boolean {
      const style = window.getComputedStyle(element);
      const bgImage = style.backgroundImage;
      return !!(bgImage && bgImage !== "none");
    }

    /**
     * Show highlight overlay
     */
    function showHighlight(element: HTMLElement) {
      if (!highlightOverlay) {
        highlightOverlay = document.createElement("div");
        highlightOverlay.style.cssText = `
          position: absolute;
          border: 2px solid #0070f3;
          background: rgba(0, 112, 243, 0.1);
          pointer-events: none;
          z-index: 2147483646;
          transition: all 0.1s;
        `;
        document.body.appendChild(highlightOverlay);
      }

      const rect = element.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      highlightOverlay.style.display = "block";
      highlightOverlay.style.left = `${rect.left + scrollX}px`;
      highlightOverlay.style.top = `${rect.top + scrollY}px`;
      highlightOverlay.style.width = `${rect.width}px`;
      highlightOverlay.style.height = `${rect.height}px`;
    }

    /**
     * Extract image data from element
     */
    async function extractImage(element: HTMLElement): Promise<string> {
      if (element instanceof HTMLImageElement) {
        // For img elements
        if (element.src.startsWith("data:")) {
          return element.src;
        }

        // Fetch remote image via background
        const response = await browser.runtime.sendMessage({
          type: "FETCH_IMAGE",
          url: element.src,
        });

        return response.imageData;
      }

      // For background images
      const style = window.getComputedStyle(element);
      const bgImage = style.backgroundImage;
      const match = bgImage.match(/url\(['"]?(.+?)['"]?\)/);

      if (match) {
        const url = match[1];

        if (!url) {
          throw new Error("Failed to extract background image URL");
        }

        if (url.startsWith("data:")) {
          return url;
        }

        // Fetch via background
        const response = await browser.runtime.sendMessage({
          type: "FETCH_IMAGE",
          url,
        });

        return response.imageData;
      }

      throw new Error("No image found in element");
    }

    /**
     * Get image dimensions
     */
    function getImageDimensions(element: HTMLElement): {
      width: number;
      height: number;
    } {
      if (element instanceof HTMLImageElement) {
        return {
          height: element.naturalHeight || element.height,
          width: element.naturalWidth || element.width,
        };
      }

      const rect = element.getBoundingClientRect();
      return {
        height: rect.height,
        width: rect.width,
      };
    }

    /**
     * Start screenshot capture
     */
    async function startScreenshotCapture() {
      try {
        // Request screenshot from background
        const [_tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        // Capture visible tab (needs to be done in background)
        const response = await browser.runtime.sendMessage({
          type: "CAPTURE_SCREENSHOT",
        });

        if (response.screenshot) {
          // Show screenshot UI for cropping
          showScreenshotUI(response.screenshot);
        }
      } catch (error) {
        console.error("Failed to capture screenshot:", error);
      }
    }

    /**
     * Show screenshot UI for cropping
     */
    function showScreenshotUI(screenshot: string) {
      // Create overlay
      overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2147483647;
        cursor: crosshair;
      `;

      // Create image
      const img = document.createElement("img");
      img.src = screenshot;
      img.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0.5;
      `;

      overlay.appendChild(img);
      document.body.appendChild(overlay);

      // Selection state
      let startX = 0;
      let startY = 0;
      let selectionBox: HTMLElement | null = null;

      // Handle drag selection
      overlay.addEventListener("mousedown", (e: MouseEvent) => {
        startX = e.clientX;
        startY = e.clientY;

        // Create selection box
        selectionBox = document.createElement("div");
        selectionBox.style.cssText = `
          position: absolute;
          border: 2px dashed #0070f3;
          background: rgba(0, 112, 243, 0.2);
          pointer-events: none;
          z-index: 2147483647;
        `;
        overlay?.appendChild(selectionBox);
      });

      overlay.addEventListener("mousemove", (e: MouseEvent) => {
        if (!selectionBox) {
          return;
        }

        const currentX = e.clientX;
        const currentY = e.clientY;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
      });

      overlay.addEventListener("mouseup", async (e: MouseEvent) => {
        if (!selectionBox) {
          return;
        }

        const endX = e.clientX;
        const endY = e.clientY;

        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (width > 10 && height > 10) {
          // Crop screenshot
          const cropped = await cropScreenshot(
            screenshot,
            left,
            top,
            width,
            height
          );

          // Send to background
          const payload: ImageCapturedPayload = {
            imageData: cropped,
            metadata: {
              dimensions: { height, width },
              timestamp: Date.now(),
            },
            source: "screenshot",
          };

          await browser.runtime.sendMessage({
            payload,
            type: "IMAGE_CAPTURED",
          });

          // Generate prompt
          await browser.runtime.sendMessage({
            payload: {
              imageData: cropped,
              language: "both",
            },
            type: "GENERATE_PROMPT",
          });
        }

        // Remove overlay
        overlay?.remove();
        overlay = null;
      });
    }

    /**
     * Crop screenshot to selection
     */
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

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

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

      return canvas.toDataURL("image/jpeg", 0.9);
    }
  },
  matches: ["<all_urls>"],
  runAt: "document_idle",
});
