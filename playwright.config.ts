import { defineConfig, devices } from "@playwright/test";

// Configurable test devices — add new entries here to test more viewports
const TEST_DEVICES = {
  "Desktop Chrome": { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
  "iPhone 14": devices["iPhone 14"],
  "iPad Mini": devices["iPad Mini"],
};

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: "http://localhost:4321",
    actionTimeout: 10000,
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: true,
  },
  projects: Object.entries(TEST_DEVICES).map(([name, use]) => ({ name, use })),
});
