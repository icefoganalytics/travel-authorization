import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { expect, test, type Response } from "@playwright/test"

import { QueryTypes } from "@sequelize/core"

import db from "@/db/db-client"

import type { AuthenticatedWorkflowAccounts } from "../authenticated-workflow-fixtures"

const authenticationDirectory = path.join(__dirname, ".auth")

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be configured for authenticated end-to-end tests.`)
  }

  return value
}

test("when test accounts sign in, their sessions identify the intended users", async ({
  browser,
}) => {
  // Arrange
  test.setTimeout(120_000)
  mkdirSync(authenticationDirectory, { recursive: true })
  const accounts: Partial<AuthenticatedWorkflowAccounts> = {}
  const roles = ["traveller", "admin"] as const

  // Act
  for (const role of roles) {
    const email = requiredEnvironmentVariable(`${role.toUpperCase()}_EMAIL`).toLowerCase()
    const storageStatePath = path.join(authenticationDirectory, `${role}.json`)
    const context = await browser.newContext({
      storageState: existsSync(storageStatePath) ? storageStatePath : undefined,
    })
    try {
      const page = await context.newPage()
      let response: Response | undefined
      if (existsSync(storageStatePath)) {
        const currentUserResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === "/api/current-user"
        )
        const signInRedirect = page
          .waitForURL((url) => url.pathname === "/sign-in" || url.hostname.endsWith(".auth0.com"))
          .then(() => undefined)
        await page.goto("/my-travel-requests")
        response = await Promise.race([currentUserResponse, signInRedirect])
      }

      if (!response?.ok()) {
        const passwordVariable = `${role.toUpperCase()}_PASSWORD`
        const password = process.env[passwordVariable]
        if (!password) {
          throw new Error(
            `The ${role} session is missing or expired. Set ${passwordVariable} for real login or refresh the authenticated storage state at ${storageStatePath}.`
          )
        }
        await page.goto("/sign-in")
        await page.getByRole("button", { name: "Sign In", exact: true }).click()
        await expect(
          page.getByRole("textbox", { name: "Email address", exact: true })
        ).toBeVisible()
        if (await page.getByRole("textbox", { name: "Enter the code shown above" }).isVisible()) {
          throw new Error(
            `Auth0 requires a human CAPTCHA for ${role}. Provide a real authenticated storage state at ${storageStatePath}; do not bypass the challenge.`
          )
        }

        await page.getByRole("textbox", { name: "Email address", exact: true }).fill(email)
        await page.getByRole("button", { name: "Continue", exact: true }).click()
        await page.getByLabel(/^Password(?: \*)?$/).fill(password)
        const [currentUserResponse] = await Promise.all([
          page.waitForResponse(
            (response) => new URL(response.url()).pathname === "/api/current-user"
          ),
          page.getByRole("button", { name: "Continue", exact: true }).click(),
        ])
        response = currentUserResponse
      }

      if (!response?.ok()) {
        throw new Error(
          `The ${role} session failed application authentication (${response?.status()}).`
        )
      }

      const { user } = (await response.json()) as { user: { id: number; email: string } }
      const [authenticatedUser] = await db.query<{ sub: string }>(
        "SELECT sub FROM users WHERE id = $1 AND email = $2",
        { bind: [user.id, user.email], type: QueryTypes.SELECT }
      )
      if (!authenticatedUser?.sub) {
        throw new Error(`The ${role} session did not return a valid authenticated identity.`)
      }
      accounts[role] = { email: user.email.toLowerCase(), auth0Subject: authenticatedUser.sub }
      await context.storageState({ path: storageStatePath })
    } finally {
      await context.close()
    }
  }

  // Assert
  expect({ travellerEmail: accounts.traveller?.email, adminEmail: accounts.admin?.email }).toEqual({
    travellerEmail: requiredEnvironmentVariable("TRAVELLER_EMAIL").toLowerCase(),
    adminEmail: requiredEnvironmentVariable("ADMIN_EMAIL").toLowerCase(),
  })
  if (accounts.traveller?.auth0Subject === accounts.admin?.auth0Subject) {
    throw new Error("Traveller and administrator must be distinct authenticated accounts.")
  }

  writeFileSync(path.join(authenticationDirectory, "accounts.json"), JSON.stringify(accounts))
})
