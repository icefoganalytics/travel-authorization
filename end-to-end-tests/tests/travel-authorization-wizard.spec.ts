/**
 * Authenticated travel authorization workflow.
 * Each account uses a separate browser context and a real Auth0 storage state.
 * @see agents/workflows/create-test-travel-request-workflow.md
 */

import { expect } from "@playwright/test"

import {
  loadAuthenticatedWorkflowAccounts,
  seedAuthenticatedWorkflowData,
  type AuthenticatedWorkflowAccounts,
} from "@/end-to-end-tests/authenticated-workflow-fixtures"
import flightOptionFactory from "@/end-to-end-tests/factories/flight-option-factory"
import { bookingFileFactory } from "@/end-to-end-tests/factories/upload-file-factories"
import { cleanEndToEndDatabases, test } from "@/end-to-end-tests/fixtures"
import createFlightOption from "@/end-to-end-tests/support/create-flight-option"
import { fillDate, selectCombobox } from "@/end-to-end-tests/support/form-inputs"
import uploadExpenseReceipts from "@/end-to-end-tests/support/upload-expense-receipts"

test.describe("travel authorization wizard", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ preserveDatabase: true })

  let accounts: AuthenticatedWorkflowAccounts
  let travelAuthId: string
  let travelDeskRequestId: string

  test.beforeAll(async () => {
    accounts = loadAuthenticatedWorkflowAccounts()
    await cleanEndToEndDatabases()
    await seedAuthenticatedWorkflowData(accounts)
  })

  test("when authenticated, the traveller sees their travel request list", async ({ browser }) => {
    // Arrange
    const context = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const page = await context.newPage()

    // Act
    await page.goto("/my-travel-requests")

    // Assert
    await expect(page.getByRole("heading", { name: "My Travel Requests" })).toBeVisible()
    await context.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Step 1–6: Traveller creates and submits a travel request
  // ---------------------------------------------------------------------------

  test("when a traveller submits a request, it awaits supervisor approval", async ({ browser }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Checkpoints and submission verify one serial wizard stage.
    // Requires tests/.auth/traveller.json (Auth0 storageState).
    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
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
    await selectCombobox(page, page.getByLabel("Purpose *", { exact: true }), "Conference")
    await page
      .getByLabel("Name of meeting/conference, mission, trade fair or course *", { exact: true })
      .fill("Annual Tech Conference 2026")
    await page.getByLabel("In Territory?", { exact: true }).uncheck()
    await selectCombobox(
      page,
      page.getByLabel("Final Destination *", { exact: true }),
      "Vancouver (BC)"
    )
    await page
      .getByLabel("Objectives *", { exact: true })
      .fill("Attend sessions relevant to travel authorization.")
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 4 — Trip Details (dates must be in the past)
    await selectCombobox(page, page.getByLabel("From", { exact: true }).nth(0), "Whitehorse (YT)")
    await selectCombobox(page, page.getByLabel("To", { exact: true }).nth(0), "Vancouver (BC)")
    await fillDate(page.getByLabel("Date", { exact: true }).nth(0), "2026-06-01")
    await page.getByLabel("Time (24 hour)", { exact: true }).nth(0).fill("08:00")
    await selectCombobox(page, page.getByLabel("Travel Method", { exact: true }).nth(0), "Aircraft")
    await selectCombobox(
      page,
      page.getByLabel("Type of Accommodation", { exact: true }).first(),
      "Hotel"
    )

    // Return segment
    await selectCombobox(page, page.getByLabel("From", { exact: true }).nth(1), "Vancouver (BC)")
    await selectCombobox(page, page.getByLabel("To", { exact: true }).nth(1), "Whitehorse (YT)")
    await fillDate(page.getByLabel("Date", { exact: true }).nth(1), "2026-06-04")
    await page.getByLabel("Time (24 hour)", { exact: true }).nth(1).fill("17:00")
    await selectCombobox(page, page.getByLabel("Travel Method", { exact: true }).nth(1), "Aircraft")

    await page.getByRole("button", { name: "Continue" }).click()
    await expect(
      page.locator(".v-snackbar").filter({ hasText: "Travel request saved." })
    ).toBeVisible()
    await expect(page).toHaveURL(/generate-estimate/)
    await expect(
      page.getByRole("cell", { name: "Hotel in Vancouver", exact: true }).first()
    ).toBeVisible()

    // Step 5 — Trip Estimates (use defaults or pre-populated rows)
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page).toHaveURL(/submit-to-supervisor/)

    // Step 6 — Submit to Supervisor
    await page.getByLabel("Travel Advance *", { exact: true }).fill("0")
    const supervisorField = page.getByLabel("Submit to *", { exact: true })
    await supervisorField.fill(accounts.supervisor.email)
    await supervisorField.press("Enter")
    await page.getByRole("button", { name: "Submit to Supervisor" }).click()
    await expect(
      page.locator(".v-snackbar").filter({ hasText: "Travel request submitted." })
    ).toBeVisible()

    // Assert
    await expect(page).toHaveURL(/awaiting-supervisor-approval/)

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Step 7: Supervisor approves the travel request
  // ---------------------------------------------------------------------------

  test("when a supervisor approves a request, the traveller advances past supervisor approval", async ({
    browser,
  }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Approval and traveller refresh verify one cross-account transition.
    // Requires tests/.auth/supervisor.json and tests/.auth/traveller.json.
    const supervisorContext = await browser.newContext({
      storageState: "./tests/.auth/supervisor.json",
    })
    const supervisorPage = await supervisorContext.newPage()
    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-supervisor-approval`
    )
    await expect(travellerPage.getByRole("button", { name: "Check status?" })).toBeVisible()

    // Act

    await supervisorPage.goto(`/manage-travel-requests/${travelAuthId}/details`)
    await supervisorPage.getByRole("button", { name: "Approve" }).click()
    const approvalDialog = supervisorPage.getByRole("dialog")
    await approvalDialog.getByRole("button", { name: "Approve" }).click()
    await expect(
      supervisorPage.locator(".v-snackbar").filter({ hasText: "Travel authorization approved!" })
    ).toBeVisible()

    await supervisorContext.close()

    // Traveller checks status
    await travellerPage.getByRole("button", { name: "Check status?" }).click()
    await travellerPage.waitForURL(/edit-traveller-details/)

    // Assert
    await expect(travellerPage.getByRole("heading", { name: "Traveler Details" })).toBeVisible()

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 8–9: Traveller details and submit to travel desk
  // ---------------------------------------------------------------------------

  test("when a traveller completes their details, it is submitted to travel desk", async ({
    browser,
  }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Details and submission verify one serial travel-desk handoff.
    // Requires tests/.auth/traveller.json.
    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    await page.goto(`/my-travel-requests/${travelAuthId}/wizard/edit-traveller-details`)

    // Step 8 — Traveler Details (form is pre-populated from the user's profile)
    await page.getByLabel("Legal First Name *", { exact: true }).fill("Marlen")
    await page.getByLabel("Legal Last Name *", { exact: true }).fill("User")
    await fillDate(page.getByLabel("Birth Date *", { exact: true }), "1990-05-01")
    await page.getByLabel("Address *", { exact: true }).fill("1234")
    await selectCombobox(page, page.getByLabel("City *", { exact: true }), "Whitehorse (YT)")
    await page.getByLabel("Province *", { exact: true }).fill("Yukon")
    await page.getByLabel("Postal Code *", { exact: true }).fill("Y1A 2C6")
    await page.getByLabel("Business Phone *", { exact: true }).fill("867-667-0000")
    await page.getByLabel("Business Email *", { exact: true }).fill(accounts.traveller.email)
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page).toHaveURL(/submit-to-travel-desk/)
    await expect(
      page.getByRole("heading", { name: "Travel Information", exact: true })
    ).toBeVisible()

    // Step 9 — Submit to Travel Desk
    const [submittedRequest] = await Promise.all([
      page.waitForResponse((response) =>
        /\/api\/travel-desk-travel-requests\/\d+\/submit$/.test(new URL(response.url()).pathname)
      ),
      page.getByRole("button", { name: "Submit", exact: true }).click(),
    ])
    const requestIdMatch = submittedRequest
      .url()
      .match(/travel-desk-travel-requests\/(\d+)\/submit/)
    if (!submittedRequest.ok() || !requestIdMatch) {
      throw new Error("Travel desk submission did not return a successful request.")
    }
    travelDeskRequestId = requestIdMatch[1]

    // Assert
    await page.waitForURL(/awaiting-flight-options/)

    await travellerContext.close()
  })

  test("when the traveller ranks flight options, travel desk can complete booking", async ({
    browser,
  }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Ranking and booking checkpoints verify one serial booking journey.
    test.setTimeout(90_000)
    const travelDeskContext = await browser.newContext({
      storageState: "./tests/.auth/travelDesk.json",
    })
    const travelDeskPage = await travelDeskContext.newPage()
    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()
    const outboundFlightOption = flightOptionFactory.build()
    const returnFlightOption = flightOptionFactory.build({
      legIndex: 1,
      departFrom: "Vancouver (BC)",
      departureDate: "2026-06-04",
      arriveTo: "Whitehorse (YT)",
      arrivalDate: "2026-06-04",
    })
    const bookingFile = bookingFileFactory.build()

    // Act
    await travelDeskPage.goto(`/travel-desk/${travelDeskRequestId}/manage-flight-segments`)
    await createFlightOption(travelDeskPage, outboundFlightOption)
    await travellerPage.goto(`/my-travel-requests/${travelAuthId}/wizard/awaiting-flight-options`)
    await expect(
      travellerPage.getByRole("button", { name: "Check status?", exact: true })
    ).toBeVisible()
    await createFlightOption(travelDeskPage, returnFlightOption)
    await travelDeskPage.goto(`/travel-desk/${travelDeskRequestId}/edit/review-manage-booking`)
    await travelDeskPage.getByRole("button", { name: "Send to Traveler", exact: true }).click()
    await expect(travelDeskPage).toHaveURL(/\/travel-desk$/)

    await travellerPage.getByRole("button", { name: "Check status?", exact: true }).click()
    await expect(travellerPage).toHaveURL(/rank-flight-options/)
    const preferences = travellerPage.getByLabel("Preference", { exact: true })
    await expect(preferences).toHaveCount(2)
    for (let index = 0; index < 2; index++) {
      await selectCombobox(travellerPage, preferences.nth(index), "1")
    }
    await travellerPage.getByRole("button", { name: "Submit Option Rankings", exact: true }).click()
    await expect(travellerPage).toHaveURL(/awaiting-booking-confirmation/)

    await travelDeskPage.goto(`/travel-desk/${travelDeskRequestId}/edit/trip-information`)
    await travelDeskPage.getByLabel("Invoice Number *", { exact: true }).fill("E2E-394")
    await travelDeskPage.getByLabel("PNR Document *", { exact: true }).setInputFiles(bookingFile)
    await travelDeskPage.getByRole("button", { name: "Save Trip Information" }).click()
    await expect(
      travelDeskPage
        .locator(".v-snackbar")
        .filter({ hasText: "Passenger name record saved successfully" })
    ).toBeVisible()
    await travelDeskPage.goto(`/travel-desk/${travelDeskRequestId}/edit/review-manage-booking`)
    await travelDeskPage.getByRole("button", { name: "Booking Complete", exact: true }).click()
    await travelDeskPage
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm", exact: true })
      .click()
    await expect(
      travelDeskPage.locator(".v-snackbar").filter({ hasText: "Travel request booked." })
    ).toBeVisible()
    await travellerPage.getByRole("button", { name: "Check status?", exact: true }).click()

    // Assert
    await expect(travellerPage).toHaveURL(/confirm-actual-travel-details/)
    await travelDeskContext.close()
    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 12–13: Traveller submits expenses
  // ---------------------------------------------------------------------------

  test("when a traveller submits an expense claim, it includes prefill, receipts, and GL coding", async ({
    browser,
  }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Prefill, receipts, and coding are prerequisites of one expense submission.
    // Requires tests/.auth/traveller.json.
    // Travel dates (2026-06-01 to 2026-06-04) must be in the past.
    // Start from the persistent state created after travel-desk booking.
    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    await page.goto(`/my-travel-requests/${travelAuthId}/wizard/awaiting-travel-start`)
    await page.waitForURL(/confirm-actual-travel-details/)

    // Step 11 — Confirm Actual Travel Details
    await expect(page.getByText("Whitehorse (YT)", { exact: true }).first()).toBeVisible()
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
    const receiptInputCount = await uploadExpenseReceipts(page)
    await expect(page.getByRole("button", { name: "View Receipt" })).toHaveCount(receiptInputCount)

    // Add a GL coding row
    await page.getByRole("button", { name: "Add Coding" }).click()
    const codingDialog = page.getByRole("dialog")
    await codingDialog.getByLabel("G/L code", { exact: true }).fill("552-503010-0222-0006-09999")
    await codingDialog.getByLabel("Amount", { exact: true }).fill("1")
    await codingDialog.getByRole("button", { name: "Save" }).click()
    await expect(page.getByRole("cell", { name: "552-503010-0222-0006-09999" })).toBeVisible()

    // Submit
    await page.getByRole("button", { name: "Submit to Supervisor" }).click()

    // Assert
    await page.waitForURL(/awaiting-expense-claim-approval/)

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 13–15: Supervisor and finance approve the expense claim
  // ---------------------------------------------------------------------------

  test("when a supervisor and finance approve an expense claim, the traveller can review expenses", async ({
    browser,
  }) => {
    // Arrange
    // marlens-test-alignment: allow-multiple-expects -- Approval checkpoints verify one serial expense-review journey.
    // Requires tests/.auth/supervisor.json, tests/.auth/finance.json, and tests/.auth/traveller.json.
    const supervisorContext = await browser.newContext({
      storageState: "./tests/.auth/supervisor.json",
    })
    const supervisorPage = await supervisorContext.newPage()

    // Act

    // Step 13 — Supervisor approves through the native confirmation.
    await supervisorPage.goto(`/manage-travel-requests/${travelAuthId}/expense`)
    supervisorPage.once("dialog", (dialog) => dialog.accept())
    await supervisorPage.getByRole("button", { name: "Approve", exact: true }).click()
    await expect(
      supervisorPage.locator(".v-snackbar").filter({ hasText: "Expense claim approved!" })
    ).toBeVisible()
    await supervisorContext.close()

    const travellerContext = await browser.newContext({
      storageState: "./tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-finance-review-and-processing`
    )
    await expect(
      travellerPage.getByRole("button", { name: "Check status?", exact: true })
    ).toBeVisible()

    // Step 14 — Finance processes expenses through the same user-facing controls.
    const financeContext = await browser.newContext({
      storageState: "./tests/.auth/finance.json",
    })
    const financePage = await financeContext.newPage()
    await financePage.goto(`/expense-processing/${travelAuthId}/expense`)
    financePage.once("dialog", (dialog) => dialog.accept())
    await financePage.getByRole("button", { name: "Approve", exact: true }).click()
    await expect(
      financePage.locator(".v-snackbar").filter({ hasText: "Travel authorization expensed!" })
    ).toBeVisible()

    await financeContext.close()

    // Traveller checks final status
    await travellerPage.getByRole("button", { name: "Check status?" }).click()

    // Assert
    await travellerPage.waitForURL(/review-expenses/)

    // Step 15 — Review Expenses — final state, status is "expensed"
    await expect(
      travellerPage.getByRole("row", {
        name: "Transportation Aircraft from Whitehorse to Vancouver 1-June-2026 $350.00 View Receipt",
        exact: true,
      })
    ).toBeVisible()

    await travellerContext.close()
  })
})
