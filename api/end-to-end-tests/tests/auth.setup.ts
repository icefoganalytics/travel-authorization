import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { authenticateAccount, authenticationDirectory, readAccountEmail } from "../authentication"

import type {
  AuthenticatedWorkflowAccount,
  AuthenticatedWorkflowAccounts,
} from "../authenticated-workflow-fixtures"

const authenticationTimeout = 120_000

test.describe("authenticated account sessions", () => {
  test.describe.configure({ mode: "serial" })
  test.setTimeout(authenticationTimeout)

  let traveller: AuthenticatedWorkflowAccount
  let supervisor: AuthenticatedWorkflowAccount
  let travelDesk: AuthenticatedWorkflowAccount
  let finance: AuthenticatedWorkflowAccount

  test.beforeAll(() => {
    mkdirSync(authenticationDirectory, { recursive: true })
  })

  test("when the traveller signs in, their session identifies the traveller", async ({
    browser,
  }) => {
    // Arrange
    const email = readAccountEmail("traveller")

    // Act
    traveller = await authenticateAccount(browser, "traveller", email)

    // Assert
    expect(traveller.email).toEqual(email)
  })

  test("when the supervisor signs in, their session identifies the supervisor", async ({
    browser,
  }) => {
    // Arrange
    const email = readAccountEmail("supervisor")

    // Act
    supervisor = await authenticateAccount(browser, "supervisor", email)

    // Assert
    expect(supervisor.email).toEqual(email)
  })

  test("when travel desk signs in, their session identifies the travel-desk account", async ({
    browser,
  }) => {
    // Arrange
    const email = readAccountEmail("travelDesk")

    // Act
    travelDesk = await authenticateAccount(browser, "travelDesk", email)

    // Assert
    expect(travelDesk.email).toEqual(email)
  })

  test("when finance signs in, their session identifies the finance account", async ({
    browser,
  }) => {
    // Arrange
    const email = readAccountEmail("finance")

    // Act
    finance = await authenticateAccount(browser, "finance", email)

    // Assert
    expect(finance.email).toEqual(email)
  })

  test("when workflow actors sign in, their authenticated identities are distinct", () => {
    // Arrange
    const accounts: AuthenticatedWorkflowAccounts = { traveller, supervisor, travelDesk, finance }
    const subjects = [
      traveller.auth0Subject,
      supervisor.auth0Subject,
      travelDesk.auth0Subject,
      finance.auth0Subject,
    ]

    // Act
    const uniqueSubjects = new Set(subjects)

    // Assert
    expect(uniqueSubjects.size).toEqual(4)

    const accountsPath = path.join(authenticationDirectory, "accounts.json")
    const accountsJson = JSON.stringify(accounts)
    writeFileSync(accountsPath, accountsJson)
  })
})
