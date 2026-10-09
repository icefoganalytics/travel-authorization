import { expect } from "@playwright/test"

import { test } from "../fixtures"

test.describe("unauthenticated smoke checks", () => {
  test("when the API is available, it responds with status", async ({ request }) => {
    // Arrange
    const apiBaseUrl = process.env["API_BASE_URL"] ?? "http://localhost:3000"

    // Act
    const response = await request.get(`${apiBaseUrl}/_status`)

    // Assert
    expect(response.status()).toBe(200)
  })

  test("when the sign-in page loads, it renders the Yukon Government heading", async ({ page }) => {
    // Arrange
    const signInPage = "/sign-in"

    // Act
    await page.goto(signInPage)

    // Assert
    await expect(page.getByRole("heading", { name: "Yukon Government" }).first()).toBeVisible()
  })

  test("when the root route loads unauthenticated, it redirects to sign-in or Auth0", async ({
    page,
  }) => {
    // Arrange
    const rootPage = "/"

    // Act
    await page.goto(rootPage)

    // Assert
    await expect(page).toHaveURL(/\/sign-in(?:[/?#]|$)|:\/\/[^/]*\.auth0\.com(?:[/?#]|$)/)
  })
})
