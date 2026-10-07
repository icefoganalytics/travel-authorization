/**
 * Travel Authorization Wizard — full happy-path end-to-end tests.
 *
 * ALL TESTS ARE SKIPPED until Auth0 storage-state fixtures and deterministic test accounts exist:
 *   - tests/.auth/traveller.json
 *   - tests/.auth/admin.json
 *   - Account environment variables documented in ../README.md
 *
 * Create the storage-state files in a global-setup.ts that logs in once per role, calls
 * `context.storageState({ path: 'end-to-end-tests/tests/.auth/<role>.json' })`,
 * and closes the context. Then wire globalSetup into playwright.config.ts.
 *
 * Multi-user pattern (from the workflow doc):
 *   Each role gets its own BrowserContext so both sessions coexist without
 *   displacing each other's Auth0 cookies.
 *
 * @see agents/workflows/create-test-travel-request-workflow.md
 */

import { expect, type Locator, type Page } from "@playwright/test"

import {
  authenticatedWorkflowAccountsFromEnvironment,
  seedAuthenticatedWorkflowData,
  seedPostBookingTravelAuthorization,
  type AuthenticatedWorkflowAccounts,
} from "../authenticated-workflow-fixtures"
import { cleanEndToEndDatabases, test } from "../fixtures"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fill a Vuetify date-picker text field and trigger Vue reactivity. */
async function fillDate(field: Locator, value: string) {
  await field.click()
  await field.selectText()
  await field.fill(value)
  await field.press("Tab")
}

/** Wait for a Vuetify snackbar containing the given text. */
async function expectToast(page: Page, text: string) {
  await expect(page.locator(`.v-snackbar:has-text("${text}")`)).toBeVisible()
}

/** Select a Vuetify combobox / autocomplete option from its overlay. */
async function selectCombobox(page: Page, field: Locator, option: string) {
  await field.click()
  await page.getByRole("option", { name: option }).click()
}

async function expectReceiptUploads(page: Page, receiptInputCount: number) {
  if (receiptInputCount === 0) {
    throw new Error("Expected prefilled expenses to provide receipt inputs.")
  }

  await expect(page.getByRole("button", { name: "View Receipt" })).toHaveCount(receiptInputCount)
}

async function expectActualTripOrigin(page: Page) {
  await expect(page.getByLabel("From").first()).toHaveValue("Whitehorse (YT)")
}

async function prefilledExpenseReceiptInputCount(page: Page): Promise<number> {
  const receiptInputs = page.locator("input[type='file'].d-none")
  await expect(receiptInputs).not.toHaveCount(0)

  return receiptInputs.count()
}

async function expectGeneralLedgerCoding(page: Page, code: string) {
  await expect(page.getByRole("cell", { name: code })).toBeVisible()
}

test.describe("travel authorization wizard", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ preserveDatabase: true })

  let accounts: AuthenticatedWorkflowAccounts
  let travelAuthId: string

  test.beforeAll(async () => {
    accounts = authenticatedWorkflowAccountsFromEnvironment()
    await cleanEndToEndDatabases()
    await seedAuthenticatedWorkflowData(accounts)
  })

  // ---------------------------------------------------------------------------
  // Wizard — Step 1–6: Traveller creates and submits a travel request
  // ---------------------------------------------------------------------------

  test.skip("when a traveller submits a request, it awaits supervisor approval", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/traveller.json (Auth0 storageState).
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    // Step 2 — create a new request
    await page.goto("/my-travel-requests")
    await page.getByRole("button", { name: "New Travel Request" }).click()

    // Extract the travel auth ID from the wizard URL
    await page.waitForURL(/\/my-travel-requests\/(\d+)\/wizard\/edit-purpose-details/)
    const travelAuthIdMatch = page.url().match(/my-travel-requests\/(\d+)\/wizard/)
    if (!travelAuthIdMatch) {
      throw new Error("Created travel request did not navigate to its wizard URL.")
    }

    travelAuthId = travelAuthIdMatch[1]

    // Step 3 — Trip Purpose
    await selectCombobox(page, page.getByLabel("Purpose *"), "Conference")
    await page
      .getByLabel("Name of meeting/conference, mission, trade fair or course *")
      .fill("Annual Tech Conference 2026")
    await page.getByLabel("In Territory?").uncheck()
    await selectCombobox(page, page.getByLabel("Final Destination *"), "Vancouver (BC)")
    await page.getByLabel("Objectives *").fill("Attend sessions relevant to travel authorization.")
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 4 — Trip Details (dates must be in the past)
    await selectCombobox(page, page.getByLabel("From").nth(0), "Whitehorse (YT)")
    await selectCombobox(page, page.getByLabel("To").nth(0), "Vancouver (BC)")
    await fillDate(page.getByLabel("Date").nth(0), "2026-06-01")
    await page.getByLabel("Time (24 hour)").nth(0).fill("08:00")
    await selectCombobox(page, page.getByLabel("Travel Method").nth(0), "Aircraft")
    await selectCombobox(page, page.getByLabel("Type of Accommodation"), "Hotel")

    // Return segment
    await selectCombobox(page, page.getByLabel("From").nth(1), "Vancouver (BC)")
    await selectCombobox(page, page.getByLabel("To").nth(1), "Whitehorse (YT)")
    await fillDate(page.getByLabel("Date").nth(1), "2026-06-04")
    await page.getByLabel("Time (24 hour)").nth(1).fill("17:00")
    await selectCombobox(page, page.getByLabel("Travel Method").nth(1), "Aircraft")

    await page.getByRole("button", { name: "Continue" }).click()
    await expectToast(page, "Travel request saved.")

    // Step 5 — Trip Estimates (use defaults or pre-populated rows)
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 6 — Submit to Supervisor
    await page.getByLabel("Travel Advance").fill("0")
    const supervisorField = page.getByLabel("Submit to")
    await supervisorField.fill(accounts.supervisor.email)
    await supervisorField.press("Enter")
    await page.getByRole("button", { name: "Submit to Supervisor" }).click()
    await expectToast(page, "Travel request submitted.")
    await page.waitForURL(/awaiting-supervisor-approval/)

    // Assert
    expect(travelAuthId).toBeTruthy()

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Step 7: Admin approves the travel request
  // ---------------------------------------------------------------------------

  test.skip("when an admin approves a request, the traveller advances past supervisor approval", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
    const adminContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/admin.json",
    })
    const adminPage = await adminContext.newPage()

    // Act

    await adminPage.goto(`/manage-travel-requests/${travelAuthId}/details`)
    await adminPage.getByRole("button", { name: "Approve" }).click()
    const approvalDialog = adminPage.getByRole("dialog")
    await approvalDialog.getByRole("button", { name: "Approve" }).click()
    await expectToast(adminPage, "Travel authorization approved!")

    await adminContext.close()

    // Traveller checks status
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-supervisor-approval`
    )
    await travellerPage.getByRole("button", { name: "Check status?" }).click()
    await travellerPage.waitForURL(/edit-traveller-details/)

    // Assert
    await expect(travellerPage.getByRole("heading", { name: "Traveler Details" })).toBeVisible()

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 8–9: Traveller details and submit to travel desk
  // ---------------------------------------------------------------------------

  test.skip("when a traveller completes their details, it is submitted to travel desk", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/traveller.json.
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    await page.goto(`/my-travel-requests/${travelAuthId}/wizard/edit-traveller-details`)

    // Step 8 — Traveler Details (form is pre-populated from the user's profile)
    await page.getByLabel("Legal First Name *").fill("Marlen")
    await page.getByLabel("Legal Last Name *").fill("User")
    await fillDate(page.getByLabel("Birth Date *"), "1990-05-01")
    await page.getByLabel("Address *").fill("1234")
    await selectCombobox(page, page.getByLabel("City *"), "Whitehorse (YT)")
    await page.getByLabel("Province *").fill("Yukon")
    await page.getByLabel("Postal Code *").fill("Y1A 2C6")
    await page.getByLabel("Business Phone *").fill("867-667-0000")
    await page.getByLabel("Business Email *").fill(accounts.traveller.email)
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 9 — Submit to Travel Desk
    await page.getByRole("button", { name: "Submit" }).click()

    // Assert
    await page.waitForURL(/awaiting-flight-options/)

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 12–13: Traveller submits expenses
  // ---------------------------------------------------------------------------

  test.skip("when a traveller submits an expense claim, it includes prefill, receipts, and GL coding", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/traveller.json.
    // Travel dates (2026-06-01 to 2026-06-04) must be in the past.
    // Start this phase after the travel desk has booked the selected flight.
    await seedPostBookingTravelAuthorization(travelAuthId)

    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    await page.goto(`/my-travel-requests/${travelAuthId}/wizard/confirm-actual-travel-details`)

    // Step 11 — Confirm Actual Travel Details
    await expectActualTripOrigin(page)
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 12 — Submit Expenses
    const prefillResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/travel-authorizations/${travelAuthId}/expenses/prefill`) &&
        response.request().method() === "POST"
    )
    await page.getByRole("button", { name: "Prefill Expenses" }).click()
    await page.getByRole("button", { name: "Prefill", exact: true }).click()
    await prefillResponse

    // Wait for the expense rows to render after the prefill request completes.
    const receiptInputCount = await prefilledExpenseReceiptInputCount(page)
    await page.evaluate((expectedReceiptInputCount) => {
      const pngBytes = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2,
        0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 15, 0, 0, 1, 1, 0,
        5, 24, 213, 78, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
      ])
      const fileInputs = document.querySelectorAll<HTMLInputElement>("input[type='file'].d-none")
      if (fileInputs.length !== expectedReceiptInputCount) {
        throw new Error("Receipt inputs changed while preparing uploads.")
      }

      for (let index = 0; index < fileInputs.length; index++) {
        const file = new File([pngBytes], `receipt_${index + 1}.png`, { type: "image/png" })
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputs[index].files = dataTransfer.files
        fileInputs[index].dispatchEvent(new Event("change", { bubbles: true }))
      }
    }, receiptInputCount)

    await expectReceiptUploads(page, receiptInputCount)

    // Add a GL coding row
    await page.getByRole("button", { name: "Add Coding" }).click()
    const codingDialog = page.getByRole("dialog")
    await codingDialog.getByLabel("G/L code").fill("552-503010-0222-0006-09999")
    await codingDialog.getByLabel("Amount").fill("1")
    await codingDialog.getByRole("button", { name: "Save" }).click()
    await expectGeneralLedgerCoding(page, "552-503010-0222-0006-09999")

    // Submit
    await page.getByRole("button", { name: "Submit to Supervisor" }).click()

    // Assert
    await page.waitForURL(/awaiting-expense-claim-approval/)

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 13–15: Supervisor and finance approve the expense claim
  // ---------------------------------------------------------------------------

  test.skip("when finance processes an expense claim, the traveller can review expenses", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
    const apiBaseUrl = process.env["API_BASE_URL"] ?? "http://localhost:3000"

    const adminContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/admin.json",
    })
    const adminPage = await adminContext.newPage()

    // Act

    // Step 13 — Supervisor approves expense claim via API (avoids native window.confirm freeze)
    await adminPage.goto(`/manage-travel-requests/${travelAuthId}/expense`)
    await adminPage.evaluate(
      async ({ apiBaseUrl, travelAuthId }) => {
        const app = (
          document.getElementById("app") as HTMLElement & {
            __vue_app__?: {
              config: {
                globalProperties: { $auth0: { getAccessTokenSilently(): Promise<string> } }
              }
            }
          }
        ).__vue_app__
        if (!app) throw new Error("Vue app not found")
        const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
        const response = await fetch(
          `${apiBaseUrl}/api/travel-authorizations/${travelAuthId}/approve-expense-claim`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        )
        return response.json()
      },
      { apiBaseUrl, travelAuthId }
    )

    // Step 14 — Finance processes expenses
    await adminPage.goto(`/expense-processing/${travelAuthId}/expense`)
    await adminPage.evaluate(
      async ({ apiBaseUrl, travelAuthId }) => {
        const app = (
          document.getElementById("app") as HTMLElement & {
            __vue_app__?: {
              config: {
                globalProperties: { $auth0: { getAccessTokenSilently(): Promise<string> } }
              }
            }
          }
        ).__vue_app__
        if (!app) throw new Error("Vue app not found")
        const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
        const response = await fetch(
          `${apiBaseUrl}/api/travel-authorizations/${travelAuthId}/expense`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        )
        return response.json()
      },
      { apiBaseUrl, travelAuthId }
    )

    await adminContext.close()

    // Traveller checks final status
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-finance-review-and-processing`
    )
    await travellerPage.getByRole("button", { name: "Check status?" }).click()

    // Assert
    await travellerPage.waitForURL(/review-expenses/)

    // Step 15 — Review Expenses — final state, status is "expensed"
    await expect(travellerPage.getByRole("heading", { name: "Review Expenses" })).toBeVisible()

    await travellerContext.close()
  })
})
