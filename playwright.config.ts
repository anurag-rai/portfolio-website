import { defineConfig, devices } from "@playwright/test";

const IS_CI = !!process.env.CI;

// Configurable test devices — add new entries here to test more viewports
// All projects use Chromium to keep CI fast and consistent.
// Mobile/tablet entries test responsive viewports, not browser engines.
const TEST_DEVICES = {
  "Desktop Chrome": { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
  "iPhone 14": { ...devices["iPhone 14"], defaultBrowserType: "chromium" as const },
  "iPad Mini": { ...devices["iPad Mini"], defaultBrowserType: "chromium" as const },
};

export default defineConfig({
  testDir: "./tests",
  timeout: IS_CI ? 60000 : 30000,
  retries: IS_CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:4321",
    actionTimeout: IS_CI ? 15000 : 10000,
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !IS_CI,
  },
  projects: Object.entries(TEST_DEVICES).map(([name, use]) => ({ name, use })),
});
