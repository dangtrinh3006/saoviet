import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "test-results/html" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", locale: "en-GB", timezoneId: "Asia/Ho_Chi_Minh" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Local: reuses `npm run dev` if up (needs DB: docker compose up -d). CI: serves the production build.
  webServer: { command: process.env.CI ? "npx next start -p 3100" : "npm run dev", url: `${baseURL}/vi`, reuseExistingServer: true, timeout: 180_000 },
});
