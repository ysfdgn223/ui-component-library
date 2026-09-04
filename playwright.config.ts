import { defineConfig, devices } from "@playwright/test";

/**
 * Seam 1: the specimen page, in a real browser.
 *
 * There is no jsdom seam. jsdom computes no styles from stylesheets, has no
 * real focus model, and cannot evaluate colour contrast — which are exactly
 * the three things this library needs verified.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
