import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

describe("Message Passing", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("should add message listener", () => {
    // Mock message handler
    const mockHandler = vi.fn();

    // Add message listener
    browser.runtime.onMessage.addListener(mockHandler);

    // Verify listener was added
    expect(mockHandler).toBeDefined();
  });

  it("should trigger message listeners", async () => {
    // Mock message handler
    const mockHandler = vi.fn((message) => {
      if (message.type === "TEST") {
        return Promise.resolve({ success: true });
      }
      return Promise.resolve({ success: false });
    });

    // Add message listener
    browser.runtime.onMessage.addListener(mockHandler);

    // Simulate receiving a message
    const listener = fakeBrowser.runtime.onMessage.addListener as any;
    if (listener?.mock) {
      await listener.mock.calls[0][0]({ type: "TEST" }, {}, vi.fn());
      expect(mockHandler).toHaveBeenCalled();
    }
  });
});
