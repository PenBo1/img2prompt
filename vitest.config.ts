import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    // Coverage configuration
    coverage: {
      exclude: [
        "node_modules/",
        ".wxt/",
        ".output/",
        "scripts/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    // Test environment
    environment: "jsdom",
    exclude: ["node_modules", ".output", ".wxt"],

    // Global variables
    globals: true,

    // Test file match patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
