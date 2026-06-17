/**
 * Travel Authorization Wizard — full happy-path end-to-end tests.
 *
 * ALL TESTS ARE SKIPPED until the Auth0 storageState fixtures exist:
 *   - tests/.auth/traveller.json
 *   - tests/.auth/admin.json
 *
 * Create them in a global-setup.ts that logs in once per role, calls
 * `context.storageState({ path: 'end-to-end-tests/tests/.auth/<role>.json' })`,
 * and closes the context.  Then wire globalSetup into playwright.config.ts.
 *
 * Multi-user pattern (from the workflow doc):
 *   Each role gets its own BrowserContext so both sessions coexist without
 *   displacing each other's Auth0 cookies.
 *
 * @see agents/workflows/create-test-travel-request-workflow.md
 */

import { test, expect, type Page } from "@playwright/test"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fill a Vuetify date-picker text field and trigger Vue reactivity. */
async function fillDate(page: Page, label: string, value: string) {
  const field = page.getByLabel(label)
  await field.click()
  await field.selectText()
  await field.fill(value)
  await field.press("Tab")
}

/** Wait for a Vuetify snackbar containing the given text. */
async function expectToast(page: Page, text: string) {
  await expect(page.locator(`.v-snackbar:has-text("${text}")`)).toBeVisible()
}

/** Select a Vuetify combobox / autocomplete option by label and option text. */
async function selectCombobox(page: Page, label: string, option: string) {
  await page.getByLabel(label).click()
  await page.getByRole("option", { name: option }).click()
}

// ---------------------------------------------------------------------------
// Wizard — Step 1–6: Traveller creates and submits a travel request
// ---------------------------------------------------------------------------

test.skip("traveller creates and submits a travel request to supervisor", async ({ browser }) => {
  // Requires tests/.auth/traveller.json (Auth0 storageState).
  const travellerContext = await browser.newContext({
    storageState: "end-to-end-tests/tests/.auth/traveller.json",
  })
  const page = await travellerContext.newPage()

  // Step 2 — create a new request
  await page.goto("/my-travel-requests")
  await page.getByRole("button", { name: "New Request" }).click()

  // Extract the travel auth ID from the wizard URL
  await page.waitForURL(/\/my-travel-requests\/(\d+)\/wizard\/edit-trip-purpose/)
  const travelAuthId = page.url().match(/my-travel-requests\/(\d+)\/wizard/)![1]

  // Step 3 — Trip Purpose
  await selectCombobox(page, "Purpose", "Conference")
  await page.getByLabel("Conference name").fill("Annual Tech Conference 2026")
  await page.getByLabel("In Territory?").getByRole("radio", { name: "No" }).click()
  await selectCombobox(page, "Final Destination", "Vancouver (BC)")
  await page.getByRole("button", { name: "Continue" }).click()
  await expectToast(page, "Travel request saved.")

  // Step 4 — Trip Details (dates must be in the past)
  await selectCombobox(page, "From", "Whitehorse (YT)")
  await selectCombobox(page, "To", "Vancouver (BC)")
  await fillDate(page, "Date", "2026-06-01")
  await page.getByLabel("Time").fill("08:00")
  await selectCombobox(page, "Travel Method", "Aircraft")
  await selectCombobox(page, "Type of Accommodation", "Hotel")

  // Return segment
  await selectCombobox(page, "From", "Vancouver (BC)")
  await selectCombobox(page, "To", "Whitehorse (YT)")
  await fillDate(page, "Date", "2026-06-04")
  await page.getByLabel("Time").fill("17:00")
  await selectCombobox(page, "Travel Method", "Aircraft")

  await page.getByRole("button", { name: "Continue" }).click()
  await expectToast(page, "Travel request saved.")

  // Step 5 — Trip Estimates (use defaults or pre-populated rows)
  await page.getByRole("button", { name: "Continue" }).click()

  // Step 6 — Submit to Supervisor
  await page.getByLabel("Travel Advance").fill("0")
  await selectCombobox(page, "Submit to", process.env["ADMIN_EMAIL"] ?? "")
  await page.getByRole("button", { name: "Submit to Supervisor" }).click()
  await expectToast(page, "Travel request submitted.")
  await page.waitForURL(/awaiting-supervisor-approval/)

  await travellerContext.close()
  // Expose travelAuthId for downstream tests by returning it (use a shared file or env var in
  // a real run — this test is a self-contained demonstration).
  expect(travelAuthId).toBeTruthy()
})

// ---------------------------------------------------------------------------
// Wizard — Step 7: Admin approves the travel request
// ---------------------------------------------------------------------------

test.skip("admin approves a travel request and traveller advances past supervisor step", async ({
  browser,
}) => {
  // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
  //
  // In a real run, travelAuthId would come from a fixture or a shared state
  // file written by the previous test.  The pattern is shown here for clarity.
  const travelAuthId = process.env["TRAVEL_AUTH_ID"] ?? "PLACEHOLDER"

  const adminContext = await browser.newContext({
    storageState: "end-to-end-tests/tests/.auth/admin.json",
  })
  const adminPage = await adminContext.newPage()

  await adminPage.goto(`/manage-travel-requests/${travelAuthId}/details`)
  await adminPage.getByRole("button", { name: "Approve" }).click()
  await adminPage.getByRole("button", { name: "Approve" }).click() // confirmation dialog
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
  await expectToast(travellerPage, "Travel authorization approved!")
  await travellerPage.waitForURL(/traveler-details/)

  await travellerContext.close()
})

// ---------------------------------------------------------------------------
// Wizard — Steps 8–9: Traveller details and submit to travel desk
// ---------------------------------------------------------------------------

test.skip("traveller fills in traveler details and submits to travel desk", async ({
  browser,
}) => {
  // Requires tests/.auth/traveller.json.
  const travelAuthId = process.env["TRAVEL_AUTH_ID"] ?? "PLACEHOLDER"

  const travellerContext = await browser.newContext({
    storageState: "end-to-end-tests/tests/.auth/traveller.json",
  })
  const page = await travellerContext.newPage()

  await page.goto(`/my-travel-requests/${travelAuthId}/wizard/traveler-details`)

  // Step 8 — Traveler Details (form is pre-populated from the user's profile)
  await page.getByLabel("Legal First Name").fill("Marlen")
  await page.getByLabel("Legal Last Name").fill("User")
  await fillDate(page, "Birth Date", "1990-05-01")
  await page.getByLabel("Address").fill("1234")
  await selectCombobox(page, "City", "Whitehorse (YT)")
  await selectCombobox(page, "Province", "Yukon")
  await page.getByLabel("Postal Code").fill("A1B C2D")
  await page.getByRole("button", { name: "Continue" }).click()

  // Step 9 — Submit to Travel Desk
  await page.getByRole("button", { name: "Submit to Travel Desk" }).click()
  await page.waitForURL(/awaiting-flight-options/)

  await travellerContext.close()
})

// ---------------------------------------------------------------------------
// Wizard — Steps 12–13: Traveller submits expenses
// ---------------------------------------------------------------------------

test.skip("traveller submits expenses with prefill, receipts, and GL coding", async ({
  browser,
}) => {
  // Requires tests/.auth/traveller.json.
  // Travel dates (2026-06-01 to 2026-06-04) must be in the past.
  const travelAuthId = process.env["TRAVEL_AUTH_ID"] ?? "PLACEHOLDER"

  const travellerContext = await browser.newContext({
    storageState: "end-to-end-tests/tests/.auth/traveller.json",
  })
  const page = await travellerContext.newPage()

  await page.goto(`/my-travel-requests/${travelAuthId}/wizard/confirm-actual-travel-details`)

  // Step 11 — Confirm Actual Travel Details
  await page.getByRole("button", { name: "Continue" }).click()

  // Step 12 — Submit Expenses
  // 1. Prefill expenses from estimates
  await page.getByRole("button", { name: "Prefill from Estimates" }).click()

  // 2. Inject fake receipts via DataTransfer API — the real file picker is hidden
  await page.evaluate(() => {
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2,
      0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 15, 0, 0, 1, 1, 0,
      5, 24, 213, 78, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ])
    const blob = new Blob([pngBytes], { type: "image/png" })
    const fileInputs = document.querySelectorAll<HTMLInputElement>("input[type='file'].d-none")
    for (let index = 0; index < fileInputs.length; index++) {
      const file = new File([blob], `receipt_${index + 1}.png`, { type: "image/png" })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputs[index].files = dataTransfer.files
      fileInputs[index].dispatchEvent(new Event("change", { bubbles: true }))
    }
  })

  // Wait for uploads to resolve — each expense row should show "View Receipt"
  await expect(page.getByRole("button", { name: "View Receipt" }).first()).toBeVisible()

  // 3. Add a GL coding row
  await page.getByRole("button", { name: "Add Coding" }).click()
  await page.getByLabel("GL Code").fill("552-503010-0222-0006-09999")

  // 4. Submit
  await page.getByRole("button", { name: "Submit to Supervisor" }).click()
  await page.waitForURL(/awaiting-expense-claim-approval/)

  await travellerContext.close()
})

// ---------------------------------------------------------------------------
// Wizard — Steps 13–15: Supervisor and finance approve the expense claim
// ---------------------------------------------------------------------------

test.skip("admin approves expense claim and finance processes expenses", async ({ browser }) => {
  // Requires tests/.auth/admin.json and tests/.auth/traveller.json.
  const travelAuthId = process.env["TRAVEL_AUTH_ID"] ?? "PLACEHOLDER"

  const adminContext = await browser.newContext({
    storageState: "end-to-end-tests/tests/.auth/admin.json",
  })
  const adminPage = await adminContext.newPage()

  // Step 13 — Supervisor approves expense claim via API (avoids native window.confirm freeze)
  await adminPage.goto(`/manage-travel-requests/${travelAuthId}/expense`)
  await adminPage.evaluate(async (id: string) => {
    const app = (document.getElementById("app") as HTMLElement & { __vue_app__?: { config: { globalProperties: { $auth0: { getAccessTokenSilently(): Promise<string> } } } } }).__vue_app__
    if (!app) throw new Error("Vue app not found")
    const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
    const response = await fetch(
      `http://localhost:3000/api/travel-authorizations/${id}/approve-expense-claim`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    )
    return response.json()
  }, travelAuthId)

  // Step 14 — Finance processes expenses
  await adminPage.goto(`/expense-processing/${travelAuthId}/expense`)
  await adminPage.evaluate(async (id: string) => {
    const app = (document.getElementById("app") as HTMLElement & { __vue_app__?: { config: { globalProperties: { $auth0: { getAccessTokenSilently(): Promise<string> } } } } }).__vue_app__
    if (!app) throw new Error("Vue app not found")
    const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
    const response = await fetch(`http://localhost:3000/api/travel-authorizations/${id}/expense`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    return response.json()
  }, travelAuthId)

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
  await travellerPage.waitForURL(/review-expenses/)

  // Step 15 — Review Expenses — final state, status is "expensed"
  await expect(
    travellerPage.getByRole("heading", { name: "Review Expenses" })
  ).toBeVisible()

  await travellerContext.close()
})
