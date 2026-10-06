import { expect } from "@playwright/test"

import { test } from "../fixtures"

test("API status endpoint responds", async ({ request }) => {
  const apiBaseUrl = process.env["API_BASE_URL"] ?? "http://localhost:3000"
  const response = await request.get(`${apiBaseUrl}/_status`)

  expect(response.status()).toBe(200)
})

test("sign-in page renders", async ({ page }) => {
  await page.goto("/sign-in")

  await expect(page.getByRole("heading", { name: "Yukon Government" }).first()).toBeVisible()
})

test("root redirects when unauthenticated", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL(/\/sign-in(?:[/?#]|$)|:\/\/[^/]*\.auth0\.com(?:[/?#]|$)/)
})

test.skip("authenticated travel authorization list loads", async ({ page }) => {
  // Requires Auth0 test credentials.
  // Implement a storageState auth fixture, then remove this skip.
  await page.goto("/travel-authorizations")
  await expect(page.getByRole("heading", { name: "Travel Authorizations" })).toBeVisible()
})
