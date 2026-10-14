import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: { timeout: 12000 },
  workers: 2,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "output/e2e-results.json" }],
  ],
  use: {
    baseURL: process.env.PHOTOBOOTH_URL ?? "http://localhost:3020",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
});
