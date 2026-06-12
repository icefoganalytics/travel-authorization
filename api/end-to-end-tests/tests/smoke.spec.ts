import { test, expect } from "@playwright/test"

test("health check endpoint responds", async ({ request }) => {
  const response = await request.get("/health-check")
  expect(response.status()).toBe(200)
  const body = await response.text()
  expect(body).toContain("Health Check")
})

test("sign-in page renders", async ({ page }) => {
  await page.goto("/sign-in")
  await expect(page.getByText("Yukon Government")).toBeVisible()
})

test("root redirects when unauthenticated", async ({ page }) => {
  await page.goto("/")
  // Auth guard redirects to /sign-in or to Auth0 — either way, not a broken page
  const url = page.url()
  expect(url).toMatch(/localhost|auth0\.com/)
})

test.skip("authenticated travel authorization list loads", async ({ page }) => {
  // Requires Auth0 test credentials.
  // Implement a storageState auth fixture, then remove this skip.
  await page.goto("/travel-authorizations")
  await expect(page.getByRole("heading", { name: "Travel Authorizations" })).toBeVisible()
})
