import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

describe("Storage Example", () => {
  beforeEach(() => {
    // Reset all fake browser state (storage, tabs, etc.) between tests
    fakeBrowser.reset();
  });

  it("should store and retrieve data from local storage", async () => {
    // Set data in storage
    await browser.storage.local.set({ key: "value" });

    // Get data from storage
    const result = await browser.storage.local.get("key");

    expect(result).toEqual({ key: "value" });
  });

  it("should return empty object for non-existent key", async () => {
    const result = await browser.storage.local.get("nonexistent");

    expect(result).toEqual({});
  });

  it("should remove data from storage", async () => {
    // Set data
    await browser.storage.local.set({ key: "value" });

    // Remove data
    await browser.storage.local.remove("key");

    // Verify removal
    const result = await browser.storage.local.get("key");

    expect(result).toEqual({});
  });
});
