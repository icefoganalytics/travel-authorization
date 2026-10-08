/**
 * Authenticated travel authorization workflow.
 * Each account uses a separate browser context and a real Auth0 storage state.
 * @see agents/workflows/create-test-travel-request-workflow.md
 */

import { expect, type Locator, type Page } from "@playwright/test"

import {
  loadAuthenticatedWorkflowAccounts,
  seedAuthenticatedWorkflowData,
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
  const input = field.and(page.locator("input"))
  const menuId = await input.getAttribute("aria-controls")
  await input.press("ArrowDown")
  if (!menuId) {
    throw new Error("The combobox did not identify its option menu.")
  }
  await page.locator(`[id="${menuId}"]`).getByRole("option", { name: option, exact: true }).click()
  await input.press("Escape")
}

async function expectReceiptUploads(page: Page, receiptInputCount: number) {
  if (receiptInputCount === 0) {
    throw new Error("Expected prefilled expenses to provide receipt inputs.")
  }

  await expect(page.getByRole("button", { name: "View Receipt" })).toHaveCount(receiptInputCount)
}

async function expectActualTripOrigin(page: Page) {
  await expect(page.getByText("Whitehorse (YT)", { exact: true }).first()).toBeVisible()
}

async function prefilledExpenseReceiptInputCount(page: Page): Promise<number> {
  const receiptInputs = page.locator("input[type='file'].d-none")
  await expect(receiptInputs).not.toHaveCount(0)

  return receiptInputs.count()
}

async function expectGeneralLedgerCoding(page: Page, code: string) {
  await expect(page.getByRole("cell", { name: code })).toBeVisible()
}

async function createFlightOption(
  page: Page,
  legIndex: number,
  departure: string,
  arrival: string,
  date: string
) {
  await page.getByRole("button", { name: "Add Flight Segment" }).click()
  await page.getByLabel("Flight *", { exact: true }).fill(`AC ${123 + legIndex}`)
  await page.getByLabel("Duration *", { exact: true }).fill("2h 30m")
  await page.getByLabel("Depart From *", { exact: true }).fill(departure)
  await page.getByLabel("Departure Date *", { exact: true }).fill(date)
  await page.getByLabel("Departure Time *", { exact: true }).fill("08:00")
  await page.getByLabel("Arrive To *", { exact: true }).fill(arrival)
  await page.getByLabel("Arrival Date *", { exact: true }).fill(date)
  await page.getByLabel("Arrival Time *", { exact: true }).fill("10:30")
  await page.getByLabel("Status *", { exact: true }).fill("Confirmed")
  await page.getByLabel("Class *", { exact: true }).fill("Economy")
  // The editor debounces draft persistence; selection snapshots the persisted segment.
  const requestId = new URL(page.url()).pathname.split("/")[2]
  await page.waitForFunction(
    ({ requestId, flightNumber }) => {
      const draft = JSON.parse(
        sessionStorage.getItem(
          `travel-desk-travel-request-${requestId}-travel-desk-flight-segments-attributes`
        ) ?? "[]"
      ) as { flightNumber: string; class: string }[]
      return draft.some(
        (segment) => segment.flightNumber === flightNumber && segment.class === "Economy"
      )
    },
    { requestId, flightNumber: `AC ${123 + legIndex}` }
  )
  await page.getByRole("checkbox", { name: "Select All", exact: true }).check()
  await page.getByRole("button", { name: "Group Selected" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Leg *", { exact: true }).press("ArrowDown")
  await page.getByRole("option").nth(legIndex).click()
  await dialog.getByLabel("Cost *", { exact: true }).fill("350")
  await dialog.getByRole("button", { name: "Create Flight Option" }).click()
  await expect(dialog).not.toBeVisible()
}

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
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
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
    await expectToast(page, "Travel request saved.")
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
    await supervisorField.fill(accounts.admin.email)
    await supervisorField.press("Enter")
    await page.getByRole("button", { name: "Submit to Supervisor" }).click()
    await expectToast(page, "Travel request submitted.")

    // Assert
    await expect(page).toHaveURL(/awaiting-supervisor-approval/)

    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Step 7: Admin approves the travel request
  // ---------------------------------------------------------------------------

  test("when an admin approves a request, the traveller advances past supervisor approval", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
    const adminContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/admin.json",
    })
    const adminPage = await adminContext.newPage()
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-supervisor-approval`
    )
    await expect(travellerPage.getByRole("button", { name: "Check status?" })).toBeVisible()

    // Act

    await adminPage.goto(`/manage-travel-requests/${travelAuthId}/details`)
    await adminPage.getByRole("button", { name: "Approve" }).click()
    const approvalDialog = adminPage.getByRole("dialog")
    await approvalDialog.getByRole("button", { name: "Approve" }).click()
    await expectToast(adminPage, "Travel authorization approved!")

    await adminContext.close()

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
    // Requires tests/.auth/traveller.json.
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
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
    test.setTimeout(90_000)
    const adminContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/admin.json",
    })
    const adminPage = await adminContext.newPage()
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    // Act
    await adminPage.goto(`/travel-desk/${travelDeskRequestId}/manage-flight-segments`)
    await createFlightOption(adminPage, 0, "Whitehorse (YT)", "Vancouver (BC)", "2026-06-01")
    await travellerPage.goto(`/my-travel-requests/${travelAuthId}/wizard/awaiting-flight-options`)
    await expect(
      travellerPage.getByRole("button", { name: "Check status?", exact: true })
    ).toBeVisible()
    await createFlightOption(adminPage, 1, "Vancouver (BC)", "Whitehorse (YT)", "2026-06-04")
    await adminPage.goto(`/travel-desk/${travelDeskRequestId}/edit/review-manage-booking`)
    await adminPage.getByRole("button", { name: "Send to Traveler", exact: true }).click()
    await expect(adminPage).toHaveURL(/\/travel-desk$/)

    await travellerPage.getByRole("button", { name: "Check status?", exact: true }).click()
    await expect(travellerPage).toHaveURL(/rank-flight-options/)
    const preferences = travellerPage.getByLabel("Preference", { exact: true })
    await expect(preferences).toHaveCount(2)
    for (let index = 0; index < 2; index++) {
      await selectCombobox(travellerPage, preferences.nth(index), "1")
    }
    await travellerPage.getByRole("button", { name: "Submit Option Rankings", exact: true }).click()
    await expect(travellerPage).toHaveURL(/awaiting-booking-confirmation/)

    await adminPage.goto(`/travel-desk/${travelDeskRequestId}/edit/trip-information`)
    await adminPage.getByLabel("Invoice Number *", { exact: true }).fill("E2E-394")
    await adminPage.getByLabel("PNR Document *", { exact: true }).setInputFiles({
      name: "booking.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(
        "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE4NgolJUVPRgo=",
        "base64"
      ),
    })
    await adminPage.getByRole("button", { name: "Save Trip Information" }).click()
    await expectToast(adminPage, "Passenger name record saved successfully")
    await adminPage.goto(`/travel-desk/${travelDeskRequestId}/edit/review-manage-booking`)
    await adminPage.getByRole("button", { name: "Booking Complete", exact: true }).click()
    await adminPage
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm", exact: true })
      .click()
    await expectToast(adminPage, "Travel request booked.")
    await travellerPage.getByRole("button", { name: "Check status?", exact: true }).click()

    // Assert
    await expect(travellerPage).toHaveURL(/confirm-actual-travel-details/)
    await adminContext.close()
    await travellerContext.close()
  })

  // ---------------------------------------------------------------------------
  // Wizard — Steps 12–13: Traveller submits expenses
  // ---------------------------------------------------------------------------

  test("when a traveller submits an expense claim, it includes prefill, receipts, and GL coding", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/traveller.json.
    // Travel dates (2026-06-01 to 2026-06-04) must be in the past.
    // Start from the persistent state created after travel-desk booking.
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const page = await travellerContext.newPage()

    // Act

    await page.goto(`/my-travel-requests/${travelAuthId}/wizard/awaiting-travel-start`)
    await page.waitForURL(/confirm-actual-travel-details/)

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
    const receipt = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
      "base64"
    )
    for (let index = 0; index < receiptInputCount; index++) {
      const fileChooserPromise = page.waitForEvent("filechooser")
      await page.getByRole("button", { name: "Add Receipt", exact: true }).first().click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles({
        name: `receipt-${index + 1}.png`,
        mimeType: "image/png",
        buffer: receipt,
      })
      await expect(page.getByRole("button", { name: "View Receipt" })).toHaveCount(index + 1)
    }

    await expectReceiptUploads(page, receiptInputCount)

    // Add a GL coding row
    await page.getByRole("button", { name: "Add Coding" }).click()
    const codingDialog = page.getByRole("dialog")
    await codingDialog.getByLabel("G/L code", { exact: true }).fill("552-503010-0222-0006-09999")
    await codingDialog.getByLabel("Amount", { exact: true }).fill("1")
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

  test("when finance processes an expense claim, the traveller can review expenses", async ({
    browser,
  }) => {
    // Arrange
    // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
    const adminContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/admin.json",
    })
    const adminPage = await adminContext.newPage()

    // Act

    // Step 13 — Supervisor approves through the native confirmation.
    await adminPage.goto(`/manage-travel-requests/${travelAuthId}/expense`)
    adminPage.once("dialog", (dialog) => dialog.accept())
    await adminPage.getByRole("button", { name: "Approve", exact: true }).click()
    await expectToast(adminPage, "Expense claim approved!")
    const travellerContext = await browser.newContext({
      storageState: "end-to-end-tests/tests/.auth/traveller.json",
    })
    const travellerPage = await travellerContext.newPage()

    await travellerPage.goto(
      `/my-travel-requests/${travelAuthId}/wizard/awaiting-finance-review-and-processing`
    )
    await expect(
      travellerPage.getByRole("button", { name: "Check status?", exact: true })
    ).toBeVisible()

    // Step 14 — Finance processes expenses through the same user-facing controls.
    await adminPage.goto(`/expense-processing/${travelAuthId}/expense`)
    adminPage.once("dialog", (dialog) => dialog.accept())
    await adminPage.getByRole("button", { name: "Approve", exact: true }).click()
    await expectToast(adminPage, "Travel authorization expensed!")

    await adminContext.close()

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
