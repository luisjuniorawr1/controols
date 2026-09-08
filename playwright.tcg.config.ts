import { defineConfig } from "@playwright/test";

/**
 * Pure TypeScript engine checks. These tests do not need the legacy static UI
 * or a browser webServer; keeping them isolated makes the TCG branch CI fast
 * and independent from the old product shell.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "tcg-*.spec.ts",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
});
