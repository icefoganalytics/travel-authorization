import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test"

const projects: PlaywrightTestConfig["projects"] = [
  {
    name: "chromium",
    testMatch: /smoke\.spec\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
]

if (process.env.E2E_AUTHENTICATED === "true") {
  projects.push(
    {
      name: "authentication",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "off",
        video: "off",
      },
    },
    {
      name: "authenticated-chromium",
      testMatch: /travel-authorization-wizard\.spec\.ts/,
      dependencies: ["authentication"],
      use: { ...devices["Desktop Chrome"] },
    }
  )
}

let retries = 0
if (process.env.CI) {
  retries = 2
}

export default defineConfig({
  testDir: "./tests",
  tsconfig: "./tsconfig.json",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:8080",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects,
})
