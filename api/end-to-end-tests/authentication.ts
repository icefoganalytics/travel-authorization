import { existsSync } from "node:fs"
import path from "node:path"

import { expect, type Browser, type Page, type Response } from "@playwright/test"
import { QueryTypes } from "@sequelize/core"

import db from "@/db/db-client"

import type {
  AuthenticatedWorkflowAccount,
  AuthenticatedWorkflowAccounts,
} from "./authenticated-workflow-fixtures"

export const authenticationDirectory = path.join(__dirname, "tests", ".auth")

const environmentPrefixes = {
  traveller: "TRAVELLER",
  supervisor: "SUPERVISOR",
  travelDesk: "TRAVEL_DESK",
  finance: "FINANCE",
} as const

type AccountRole = keyof AuthenticatedWorkflowAccounts

type CurrentUserResponse = {
  user: {
    id: number
    email: string
  }
}

export function readAccountEmail(role: AccountRole): string {
  const environmentPrefix = environmentPrefixes[role]
  const variableName = `${environmentPrefix}_EMAIL`
  const value = process.env[variableName]
  if (!value) {
    throw new Error(`${variableName} must be configured for authenticated end-to-end tests.`)
  }

  return value.toLowerCase()
}

function isCurrentUserResponse(response: Response): boolean {
  const url = new URL(response.url())

  return url.pathname === "/api/current-user"
}

function isSignInUrl(url: URL): boolean {
  if (url.pathname === "/sign-in") {
    return true
  }

  return url.hostname.endsWith(".auth0.com")
}

async function restoreSavedSession(page: Page): Promise<Response | undefined> {
  const currentUserResponse = page.waitForResponse(isCurrentUserResponse)
  const signInRedirect = page.waitForURL(isSignInUrl)

  await page.goto("/my-travel-requests")

  const response = await Promise.race([currentUserResponse, signInRedirect])
  if (!response) {
    return undefined
  }

  return response
}

async function signIn(
  page: Page,
  role: AccountRole,
  email: string,
  storageStatePath: string
): Promise<Response> {
  const environmentPrefix = environmentPrefixes[role]
  const passwordVariable = `${environmentPrefix}_PASSWORD`
  const password = process.env[passwordVariable]
  if (!password) {
    const message =
      `The ${role} session is missing or expired. ` +
      `Set ${passwordVariable} for real login or refresh the authenticated storage state ` +
      `at ${storageStatePath}.`

    throw new Error(message)
  }

  await page.goto("/sign-in")

  const signInButton = page.getByRole("button", { name: "Sign In", exact: true })
  await signInButton.click()

  const emailField = page.getByRole("textbox", { name: "Email address", exact: true })
  await expect(emailField).toBeVisible()

  const captchaField = page.getByRole("textbox", { name: "Enter the code shown above" })
  const requiresCaptcha = await captchaField.isVisible()
  if (requiresCaptcha) {
    const message =
      `Auth0 requires a human CAPTCHA for ${role}. ` +
      `Provide a real authenticated storage state at ${storageStatePath}; ` +
      "do not bypass the challenge."

    throw new Error(message)
  }

  const continueButton = page.getByRole("button", { name: "Continue", exact: true })
  const passwordField = page.getByLabel(/^Password(?: \*)?$/)

  await emailField.fill(email)
  await continueButton.click()
  await passwordField.fill(password)

  const currentUserResponse = page.waitForResponse(isCurrentUserResponse)
  await continueButton.click()

  return currentUserResponse
}

async function identifyAuthenticatedAccount(
  response: Response,
  role: AccountRole
): Promise<AuthenticatedWorkflowAccount> {
  if (!response.ok()) {
    const status = response.status()

    throw new Error(`The ${role} session failed application authentication (${status}).`)
  }

  const body = await response.json()
  const { user } = body as CurrentUserResponse
  const [authenticatedUser] = await db.query<{ sub: string }>(
    "SELECT sub FROM users WHERE id = $1 AND email = $2",
    {
      bind: [user.id, user.email],
      type: QueryTypes.SELECT,
    }
  )
  const auth0Subject = authenticatedUser?.sub
  if (!auth0Subject) {
    throw new Error(`The ${role} session did not return a valid authenticated identity.`)
  }

  const email = user.email.toLowerCase()

  return { email, auth0Subject }
}

export async function authenticateAccount(
  browser: Browser,
  role: AccountRole,
  email: string
): Promise<AuthenticatedWorkflowAccount> {
  const storageStatePath = path.join(authenticationDirectory, `${role}.json`)
  const hasSavedSession = existsSync(storageStatePath)
  let storageState: string | undefined
  if (hasSavedSession) {
    storageState = storageStatePath
  }

  const context = await browser.newContext({ storageState })
  try {
    const page = await context.newPage()
    let response: Response | undefined
    if (hasSavedSession) {
      response = await restoreSavedSession(page)
    }

    if (!response || !response.ok()) {
      response = await signIn(page, role, email, storageStatePath)
    }

    const account = await identifyAuthenticatedAccount(response, role)
    await context.storageState({ path: storageStatePath })

    return account
  } finally {
    await context.close()
  }
}
