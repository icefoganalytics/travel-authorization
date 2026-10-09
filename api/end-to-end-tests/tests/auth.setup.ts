import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { authenticateAccount, authenticationDirectory, readAccountEmail } from "../authentication"

import type { AuthenticatedWorkflowAccounts } from "../authenticated-workflow-fixtures"

const authenticationTimeout = 120_000

test.describe("authenticated account sessions", () => {
  test("when test accounts sign in, their sessions identify the intended users", async ({
    browser,
  }) => {
    // Arrange
    test.setTimeout(authenticationTimeout)
    mkdirSync(authenticationDirectory, { recursive: true })

    const travellerEmail = readAccountEmail("traveller")
    const supervisorEmail = readAccountEmail("supervisor")
    const travelDeskEmail = readAccountEmail("travelDesk")
    const financeEmail = readAccountEmail("finance")

    // Act
    const traveller = await authenticateAccount(browser, "traveller", travellerEmail)
    const supervisor = await authenticateAccount(browser, "supervisor", supervisorEmail)
    const travelDesk = await authenticateAccount(browser, "travelDesk", travelDeskEmail)
    const finance = await authenticateAccount(browser, "finance", financeEmail)
    const accounts: AuthenticatedWorkflowAccounts = { traveller, supervisor, travelDesk, finance }

    // Assert
    const authenticatedEmails = {
      traveller: traveller.email,
      supervisor: supervisor.email,
      travelDesk: travelDesk.email,
      finance: finance.email,
    }
    const expectedEmails = {
      traveller: travellerEmail,
      supervisor: supervisorEmail,
      travelDesk: travelDeskEmail,
      finance: financeEmail,
    }
    expect(authenticatedEmails).toEqual(expectedEmails)

    const subjects = [
      traveller.auth0Subject,
      supervisor.auth0Subject,
      travelDesk.auth0Subject,
      finance.auth0Subject,
    ]
    const uniqueSubjects = new Set(subjects)
    if (uniqueSubjects.size !== subjects.length) {
      throw new Error("Every workflow actor must have a distinct authenticated account.")
    }

    const accountsPath = path.join(authenticationDirectory, "accounts.json")
    const accountsJson = JSON.stringify(accounts)
    writeFileSync(accountsPath, accountsJson)
  })
})
