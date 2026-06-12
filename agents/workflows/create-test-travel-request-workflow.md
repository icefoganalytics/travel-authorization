---
description: Create a complete end-to-end test travel request through the My Travel Request wizard
---

# Create Test Travel Request Workflow

See also: [Flow Chart, Travel Authorization Wizard UI Flow, 2026-06-12](<../../_Design/Flow Chart, Travel Authorization Wizard UI Flow, 2026-06-12.wsd>)

## Intent

**WHY this workflow exists:** The travel authorization wizard has 16 steps and requires two
different user accounts (traveller + supervisor/admin) to complete. Manually navigating it is slow
and error-prone. This workflow lets an AI agent (or a future Playwright script) reproduce a
complete, fully-approved travel request quickly and repeatably.

**WHAT this workflow produces:** A travel request for Travel Auth #XXXX that has been submitted
through all wizard steps up to (and including) expense submission, with supervisor and finance
approvals obtained by switching between user accounts.

**Decision Rules:**

- **Travel dates MUST be in the past:** The Submit Expenses step's Continue button stays disabled
  until `lastTravelSegment.departureOn < new Date()`. Always use dates from earlier in the current
  month (e.g. first week), never future dates.
- **Use triple-click + type for date fields, never `form_input`:** `form_input` sets the DOM value
  but does not fire Vue's input event, so the date never registers. Triple-click the field to
  select all text, then type the date in `YYYY-MM-DD` format.
- **Accounts:** User = `$TRAVELLER_EMAIL`. Supervisor/Admin = `$ADMIN_EMAIL`. Never use the admin
  account for the traveller role or vice versa.
- **Session switching required at approval steps:** Auth0 cookies are shared across all tabs in
  the same browser profile. Logging in as admin displaces the traveller session in every tab. At
  each approval step you must sign in as admin, perform the approval, then sign back in as the
  traveller before clicking **Check status?**. The JS `loginWithRedirect` call (see Steps 7 and
  13) is the fastest way to switch back without navigating away.
- **Expense prefill exists:** When you reach the Submit Expenses step the app offers to prefill
  expenses from the estimates already created in Step 3. Always use prefill — it saves time.
- **Coding rows are required before Submit Expenses Continue is enabled:** Add at least one General
  Ledger Coding row before clicking Continue on the Submit Expenses step.

---

## Accounts & URLs

| Role | Env var | Used for |
|---|---|---|
| Traveller | `$TRAVELLER_EMAIL` / `$TRAVELLER_PASSWORD` | All wizard steps as the traveller |
| Admin / Supervisor | `$ADMIN_EMAIL` / `$ADMIN_PASSWORD` | Approvals (Steps 7, 13), Finance review (Step 14) |

Credentials are stored in `.envrc` (not committed). Run `direnv allow` after filling them in.

App base URL: `http://localhost:8080`

### Key admin URLs

| Purpose | URL |
|---|---|
| Travel request details + approval | `/manage-travel-requests/:id/details` |
| Expense claim details + finance approval | `/manage-travel-requests/:id/expense` |
| Finance expense processing | `/expense-processing/:id/expense` |
| Travel desk (flight options) | `/travel-desk` |

---

## Step 1 — Log in as the traveller

1. Navigate to `http://localhost:8080`.
2. Log in as the traveller account (`$TRAVELLER_EMAIL` / `$TRAVELLER_PASSWORD`).
3. Confirm you land on the Dashboard.

---

## Step 2 — Create a new travel request

1. In the left sidebar, click **My Travel Requests**.
2. Click **New Request** (top-right of the list).
3. Note the new Travel Auth ID from the URL: `/my-travel-requests/:id/wizard/edit-trip-purpose`.

---

## Step 3 — Trip Purpose (Wizard Step 1)

Fill in the purpose form:

| Field | Value |
|---|---|
| Purpose | `Conference` |
| Conference name | `Annual Tech Conference 2026` |
| In Territory? | `No` |
| Final Destination | `Vancouver (BC)` |
| Department | *(your department, or leave default)* |
| Branch | *(leave default)* |

Click **Continue**.

---

## Step 4 — Trip Details (Wizard Step 2)

**CRITICAL: set dates in the PAST.**

Travel type: **Round trip** (default).

### Depart segment

| Field | Value |
|---|---|
| From | `Whitehorse (YT)` |
| To | `Vancouver (BC)` |
| Date | First Monday of the current month, e.g. `2026-06-01` |
| Time | `08:00` |
| Travel Method | `Aircraft` |
| Type of Accommodation | `Hotel` |

### Return segment

| Field | Value |
|---|---|
| From | `Vancouver (BC)` |
| To | `Whitehorse (YT)` |
| Date | 3 days after depart, e.g. `2026-06-04` |
| Time | `17:00` |
| Travel Method | `Aircraft` |

### How to enter date values (AI note)

Date fields are Vuetify pickers backed by Vue reactive state. `form_input` does NOT work — it
writes the DOM value but never fires the Vue `input` event. Use this pattern instead:

```
triple_click(dateField)   # selects all existing text
type("2026-06-01")        # replaces it and fires the event
key("Tab")                # commits the value
```

Click **Continue**. Verify "Travel request saved." toast appears.

---

## Step 5 — Trip Estimates (Wizard Step 3)

The estimates table is pre-populated from a previous session (or will auto-generate). If it is
empty, add at minimum:

- Accommodations — Hotel in Vancouver — `$250.00` (×3 nights)
- Transportation — Aircraft from Whitehorse to Vancouver — `$350.00`
- Transportation — Aircraft from Vancouver to Whitehorse — `$350.00`

Edit/Delete buttons are visible when the policy fix is in place (`item.policy.update` /
`item.policy.destroy` — see `EstimatesEditDataTableServer.vue`).

Click **Continue**.

---

## Step 6 — Submit Travel Request (Wizard Step 4)

Review the summary. Fill in the Approvals section:

| Field | Value |
|---|---|
| Travel Advance | `0` |
| Pre-approved travel | *(leave blank)* |
| Submit to | `$ADMIN_EMAIL` |

Click **Submit to Supervisor**. Verify "Travel request submitted." toast and URL changes to
`/awaiting-supervisor-approval`.

---

## Step 7 — Supervisor Approval (Wizard Step 5, admin account)

The wizard blocks at "Waiting for Approval" until the designated supervisor approves.

> **Session displacement warning:** Auth0 cookies are shared across all tabs in the same browser
> profile. Logging in as admin here will log the traveller out of every tab. The wizard's
> `PATCH /api/travel-authorizations/:id/wizard` endpoint is owner-only (`WizardPolicy#update`), so
> if the admin session is active when the traveller clicks Continue, the call silently returns 403
> and the wizard never advances. Always sign back in as the traveller before clicking **Check
> status?**.

### Admin approval steps

1. Note the current wizard URL (you will need to return here after signing back in).
2. Sign in as the admin account (`$ADMIN_EMAIL` / `$ADMIN_PASSWORD`).
   Confirm the admin nav bar appears (Travel Desk, Manage Travel Requests, Expense Processing
   visible).
3. Navigate to `/manage-travel-requests/:id/details` (replace `:id` with the travel auth ID).
4. Scroll down to the **Management** card.
5. Click the green **Approve** button. A confirmation dialog appears:
   `"Approve travel of [Traveller Name] to [Destination]?"`
6. Click **Approve** in the dialog. Verify "Travel authorization approved!" toast.

### Return to traveller session

Sign back in as the traveller. The fastest way without navigating away from the wizard tab:

```javascript
// Run in the browser console on the wizard tab
const auth0 = document.getElementById('app').__vue_app__.config.globalProperties.$auth0
auth0.loginWithRedirect({
  authorizationParams: { prompt: 'login', login_hint: '$TRAVELLER_EMAIL' },
  appState: { target: '/my-travel-requests/:id/wizard/awaiting-supervisor-approval' }
})
```

Enter the traveller password on the Auth0 page. After redirect, click **Check status?**. Toast:
"Travel authorization approved!" Wizard advances to Traveler Details.

> **Playwright:** Use a second `browser.newContext({ storageState: 'tests/.auth/admin.json' })`
> for the admin — it gets its own cookie jar and never disturbs the traveller context.

---

## Step 8 — Traveler Details (Wizard Step 6)

The form is pre-populated from the user's profile. The header reads "Travel Desk Request /
Traveler Details". Verify and fill in:

| Field | Test value (pre-filled) |
|---|---|
| Legal First Name | `Marlen` |
| Legal Middle Name | *(blank)* |
| Legal Last Name | `User` |
| Birth Date | `1990-05-01` |
| Address | `1234` |
| City | `Whitehorse (YT)` |
| Province | `Yukon` |
| Postal Code | `A1B C2D` |

Scroll down to fill in the emergency contact fields if required. Click **Continue**.

---

## Step 9 — Submit to Travel Desk (Wizard Step 7)

Review travel desk form (flight preferences, hotel preferences). Click **Submit to Travel Desk**.
Wizard advances to Step 8 (Awaiting Flight Options).

---

## Step 10 — Flight Options (Wizard Steps 8–9, admin action)

An admin/travel-desk user must provide flight options. Log in as the admin account
(`$ADMIN_EMAIL` / `$ADMIN_PASSWORD`) and navigate to the **Travel Desk** admin panel to add
flight options, then return to the traveller window and rank them.

*(This step may vary depending on whether the app is in a state where travel desk is active.)*

---

## Step 11 — Confirm Actual Travel Details (Wizard Step 12)

After booking confirmation, the traveller confirms actual travel details. Update each segment with
the real (or test) departure details. Click **Continue**.

---

## Step 12 — Submit Expenses (Wizard Step 13)

This step requires:

1. **Travel dates are in the past** — the Continue button stays disabled until
   `lastTravelSegment.departureOn < new Date()`. If you used June 1–4 dates and today is June 11+,
   this is satisfied automatically.

2. **Add expenses** — click **Prefill from Estimates** to copy the estimates into actual expenses.
   This is the fastest path.

3. **Upload receipts (REQUIRED)** — receipts are mandatory for all non-Meals-and-Incidentals
   expenses. The `isReadyToSubmit` computed in `RequestApprovalForm.vue` checks
   `allRelevantExpensesHaveReceipts`, which filters out M&I and requires every remaining expense to
   have a non-null `receipt`. The Continue button will show an error snackbar instead of submitting
   if any receipt is missing.

   **AI workaround for testing:** Inject fake receipts via the DataTransfer API without opening
   the file picker:

   ```javascript
   const pngBytes = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,2,0,0,0,144,119,83,222,0,0,0,12,73,68,65,84,8,215,99,248,15,0,0,1,1,0,5,24,213,78,0,0,0,0,73,69,78,68,174,66,96,130])
   const blob = new Blob([pngBytes], { type: 'image/png' })
   const fileInputs = document.querySelectorAll('input[type="file"].d-none')
   for (let i = 0; i < fileInputs.length; i++) {
     const file = new File([blob], `receipt_${i+1}.png`, { type: 'image/png' })
     const dt = new DataTransfer()
     dt.items.add(file)
     fileInputs[i].files = dt.files
     fileInputs[i].dispatchEvent(new Event('change', { bubbles: true }))
   }
   ```

   Wait a moment for the uploads to complete, then verify each expense row shows "View Receipt"
   instead of "Add Receipt" before proceeding.

4. **Add at least one Coding row** — click **Add Coding** and fill in one General Ledger Coding
   entry. The Continue button stays disabled until at least one coding row exists.

   Valid G/L code format (YG finance system): `552-503010-0222-0006-09999`

5. Click **Submit Expenses** (the "Submit to Supervisor" button in the `RequestApprovalForm` at
   the bottom of the page, inside the wizard's Continue button flow).

---

## Step 13 — Awaiting Supervisor Approval of Expenses (Wizard Step 14)

The wizard blocks at step `awaiting-expense-claim-approval` until the supervisor approves.

### Admin approval steps

The **Manage Travel Requests** expense page (`/manage-travel-requests/:id/expense`) has a
**Management** card with **Approve** and **Deny** buttons. These call `blockedToTrueConfirm()`
(a native `window.confirm()` dialog) which freezes the browser extension.

Sign in as the admin account, then use one of these options:

**Option A — click in the browser (manual):** Navigate to `/manage-travel-requests/:id/expense`,
click **Approve** in the Management card, and confirm the native dialog manually.

**Option B — call the API directly (AI-friendly):**

```javascript
// Run in the browser console while signed in as admin
(async () => {
  const app = document.getElementById('app').__vue_app__
  const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
  const resp = await fetch('http://localhost:3000/api/travel-authorizations/:id/approve-expense-claim', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  const body = await resp.json()
  console.log(body.travelAuthorization.status, body.travelAuthorization.wizardStepName)
})()
// Expected: "expense_claim_approved"  "awaiting-finance-review-and-processing"
```

### Return to traveller session

Sign back in as the traveller (same `loginWithRedirect` pattern as Step 7, targeting
`/my-travel-requests/:id/wizard/awaiting-expense-claim-approval`). Click **Check status?**. Toast:
"Expense claim approved by supervisor! Awaiting finance review." Wizard advances to step 15
(`awaiting-finance-review-and-processing`).

---

## Step 14 — Finance Review (Wizard Step 15)

The wizard shows "Awaiting Finance Review And Processing" with a **Check status?** button.

### Finance user actions (admin tab)

1. Navigate to **Expense Processing** in the left sidebar (`/expense-processing`).
2. TA #9 appears in the **Awaiting Finance Review** table. Click the row.
3. You land on `/expense-processing/:id/details`. Click the **Expenses** tab
   (`/expense-processing/:id/expense`).

The **Expenses** tab is the full-form finance review page. It contains:

| Section | What the finance user can do |
|---|---|
| **Traveler Expenses** | View accommodations & transportation; **View Receipt** links |
| **Meals and Incidentals** | View M&I rows; **Add Receipt** if not uploaded |
| **Expense Totals** | Read-only subtotal / travel advance / total claim |
| **Coding** | Add / edit / delete G/L coding rows |
| **Finance Management** | **Approve**, **Deny**, **Send Back to Traveler**, **Send Back to Supervisor** |

#### Approve (mark as expensed)

The **Approve** button calls `POST /api/travel-authorizations/:id/expense` via
`blockedToTrueConfirm()` (native dialog). Use the API directly to avoid freezing the extension:

```javascript
(async () => {
  const app = document.getElementById('app').__vue_app__
  const token = await app.config.globalProperties.$auth0.getAccessTokenSilently()
  const resp = await fetch('http://localhost:3000/api/travel-authorizations/9/expense', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  const body = await resp.json()
  console.log(body.travelAuthorization.status, body.travelAuthorization.wizardStepName)
})()
// Expected: "expensed"  "review-expenses"
```

#### Send Back to Traveler / Send Back to Supervisor

These open Vuetify dialogs (not native confirms) — safe to click in the browser extension.
The dialog prompts for a reason/note before sending back.

### Advance traveller wizard to step 16

Sign back in as the traveller (same `loginWithRedirect` pattern as Step 7, targeting
`/my-travel-requests/:id/wizard/awaiting-finance-review-and-processing`), then click **Check
status?**. Toast confirms finance approval; wizard advances to step 16 (`review-expenses`).

---

## Step 15 — Review Expenses (Wizard Step 16)

Final state (`review-expenses`). The traveller sees the fully approved expense summary. No
further action is required from the traveller. The travel authorization status is `expensed`.

---

## Quick Reference: Wizard Step Names

The canonical step names (used as URL segments) are defined in the
`TravelAuthorizationWizardStepNames` enum in
`web/src/api/travel-authorizations-api.ts`.

All wizard URLs follow the pattern `/my-travel-requests/:id/wizard/:stepName`.

> **Navigation rule:** Always advance the wizard by clicking the **Continue** /
> **Submit** / **Check status?** / **Back** buttons in the UI. Never navigate by
> typing a URL directly — the wizard's Continue buttons perform server-side state
> transitions that bare URL navigation skips, which leaves the wizard in an
> inconsistent state.

---

## Playwright Porting Notes

When converting this workflow to Playwright:

- **Multi-user isolation:** Use `browser.newContext()` for each role — each context has its own
  isolated cookie jar so both sessions can stay alive simultaneously, eliminating the sign-in/out
  switching this manual workflow requires. Authenticate once per role, save state, and reuse:

  ```typescript
  // global-setup.ts — run once before the test suite
  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  // ... log in as admin via Auth0 ...
  await adminContext.storageState({ path: 'tests/.auth/admin.json' })
  await adminContext.close()

  const travellerContext = await browser.newContext()
  // ... log in as traveller ...
  await travellerContext.storageState({ path: 'tests/.auth/traveller.json' })
  await travellerContext.close()

  // In each test:
  const adminCtx = await browser.newContext({ storageState: 'tests/.auth/admin.json' })
  const travellerCtx = await browser.newContext({ storageState: 'tests/.auth/traveller.json' })
  ```

- **Date fields:** Use `page.fill('[placeholder="YYYY-MM-DD"]', '2026-06-01')` combined with
  `page.dispatchEvent('[placeholder="YYYY-MM-DD"]', 'input')` to trigger Vue reactivity. Or use
  `page.evaluate` to dispatch a native `InputEvent`.
- **Wait for toasts:** `await page.waitForSelector('.v-snackbar:has-text("Travel request saved.")')`.
- **Combobox/autocomplete selects:** Vuetify comboboxes need a click to open, then click on the
  list item. Use `page.click('[aria-label="From"]')` + `page.click('[role="option"]:has-text("Whitehorse (YT)")')`.
- **Policy-gated buttons:** Edit/Delete buttons are conditionally rendered via `v-if="item.policy.update"`.
  Don't use `waitForSelector` with a timeout if the user lacks permission — check the API response
  `policy.update` field first.
