import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

describe("Runtime API", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("should have runtime ID", () => {
    // biome-ignore lint/style/useDestructuring: browser.runtime.id is not an object to destructure
    const id = browser.runtime.id;

    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("should get extension URL", () => {
    const url = browser.runtime.getURL("/popup.html");

    expect(url).toBeDefined();
    expect(url).toContain("chrome-extension://");
  });

  it("should mock runtime.getManifest", () => {
    // Mock the getManifest function
    vi.spyOn(browser.runtime, "getManifest").mockReturnValue({
      manifest_version: 3,
      name: "Test Extension",
      version: "1.0.0",
    });

    const manifest = browser.runtime.getManifest();

    expect(manifest).toBeDefined();
    expect(manifest.manifest_version).toBe(3);
  });
});
