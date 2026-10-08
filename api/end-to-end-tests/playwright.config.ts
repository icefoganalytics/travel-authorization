import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  tsconfig: "./tsconfig.json",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:8080",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    ...(process.env.E2E_AUTHENTICATED === "true"
      ? [
          {
            name: "authentication",
            testMatch: /auth\.setup\.ts/,
            use: {
              ...devices["Desktop Chrome"],
              screenshot: "off" as const,
              video: "off" as const,
            },
          },
          {
            name: "authenticated-chromium",
            testMatch: /travel-authorization-wizard\.spec\.ts/,
            dependencies: ["authentication"],
            use: { ...devices["Desktop Chrome"] },
          },
        ]
      : []),
  ],
})
