---
description: Create a complete end-to-end test travel request through the My Travel Request wizard
---

# Create Test Travel Request Workflow

## Intent

**WHY this workflow exists:** The travel authorization wizard has 16 steps and requires two
different user accounts (traveller + supervisor/admin) to complete. Manually navigating it is slow
and error-prone. This workflow lets an AI agent (or a future Playwright script) reproduce a
complete, fully-approved travel request quickly and repeatably.

**WHAT this workflow produces:** A travel request for Travel Auth #XXXX that has been submitted
through all wizard steps up to (and including) expense submission, with supervisor and finance
approvals obtained by switching to a second browser window logged in as the admin account.

**Decision Rules:**

- **Travel dates MUST be in the past:** The Submit Expenses step's Continue button stays disabled
  until `lastTravelSegment.departureOn < new Date()`. Always use dates from earlier in the current
  month (e.g. first week), never future dates.
- **Use triple-click + type for date fields, never `form_input`:** `form_input` sets the DOM value
  but does not fire Vue's input event, so the date never registers. Triple-click the field to
  select all text, then type the date in `YYYY-MM-DD` format.
- **Accounts:** User = `$TRAVELLER_EMAIL`. Supervisor/Admin = `$ADMIN_EMAIL`. Never use the admin
  account for the traveller role or vice versa.
- **Approvals require a second browser window:** Open a separate window logged in as the admin
  account for all approval steps. Switch back to the traveller window afterward and click
  **Check status?** to advance the wizard.
- **Expense prefill exists:** When you reach the Submit Expenses step the app offers to prefill
  expenses from the estimates already created in Step 3. Always use prefill — it saves time.
- **Coding rows are required before Submit Expenses Continue is enabled:** Add at least one General
  Ledger Coding row before clicking Continue on the Submit Expenses step.

---

## Accounts & URLs

| Role | Env var | Used for |
|---|---|---|
| Traveller | `$TRAVELLER_EMAIL` / `$TRAVELLER_PASSWORD` | All wizard steps as the traveller |
| Admin / Supervisor | `$ADMIN_EMAIL` / `$ADMIN_PASSWORD` | Approvals (Steps 5, 15) |

Credentials are stored in `.envrc` (not committed). Run `direnv allow` after filling them in.

App base URL: `http://localhost:8080`

### Key admin URLs

| Purpose | URL |
|---|---|
| Travel request details + approval | `/manage-travel-requests/:id/details` |
| Expense claim details + finance approval | `/manage-travel-requests/:id/expense` |
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

## Step 7 — Supervisor Approval (Wizard Step 5, admin window)

The wizard blocks at "Waiting for Approval" until the designated supervisor approves.

### Admin approval steps

> **Tab-session note:** Auth0 sessions are shared across all tabs in the same browser. Logging in
> as admin in a second tab logs the traveller out of the first tab. For a Playwright test, use
> `browser.newContext()` for a separate admin context that doesn't interfere with the traveller
> context. In a manual test, you can use the same browser — just be aware the traveller tab will
> show the admin user after you log in as admin.

1. Open a new browser tab (or a second browser window / Playwright context).
2. Navigate to `http://localhost:8080`.
3. Sign out of the current session, then log in as the admin account
   (`$ADMIN_EMAIL` / `$ADMIN_PASSWORD`). Confirm the admin nav bar appears (Travel Desk, Manage
   Travel Requ…, Expense Processing, QA Scenarios visible).
4. Navigate to `http://localhost:8080/manage-travel-requests/:id/details` (replace `:id` with the
   travel auth ID noted in Step 2).
5. Scroll down past the **Details** card to the **Management** card.
6. Click the green **Approve** button. A confirmation dialog appears:
   `"Approve travel of [Traveller Name] to [Destination]?"`
7. Click **Approve** in the dialog. Verify "Travel authorization approved!" toast on the admin side.

### Return to traveller window

After the admin approves, switch back to the traveller window:

1. Click **Check status?** on the Waiting for Approval page.
   - The snackbar "Travel authorization approved!" confirms the API returned the approved status.
   - The wizard *may* fail to navigate automatically due to cascading Vue render errors triggered
     during the component transition.
2. If the page does not advance automatically, navigate directly to the next step:
   `http://localhost:8080/my-travel-requests/:id/wizard/edit-traveller-details`

> **AI Note (Playwright):** Use separate `browser.newContext()` for the admin — it gets its own
> cookie jar, so the traveller session is preserved. The admin context only needs to live long
> enough to click Approve.

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

3. **Upload receipts** (optional for testing) — receipts can be skipped if the policy permits.

4. **Add at least one Coding row** — click **Add Coding** and fill in one General Ledger Coding
   entry. The Continue button stays disabled until at least one coding row exists.

5. Click **Submit Expenses** (via the `RequestApprovalForm` at the bottom of the page).

---

## Step 13 — Awaiting Supervisor Approval of Expenses (Wizard Step 14)

The wizard blocks until the supervisor approves the expense claim.

> **TODO:** Covered by the same second-window admin flow as Step 7. Approve the expense claim
> from the admin panel, then return to the traveller window and click **Check status?**.

---

## Step 14 — Finance Review (Wizard Step 15)

A finance user must review and approve. Navigate to the **Finance** admin panel as admin and
process the expense claim. The wizard then advances to Step 16 (Review Expenses).

---

## Step 15 — Review Expenses (Wizard Step 16)

Final state — the traveller can review the approved expenses. No further action required.

---

## Quick Reference: Wizard URL Map

| Step | URL segment | Description |
|---|---|---|
| 1 | `/edit-trip-purpose` | Conference/purpose details |
| 2 | `/edit-trip-details` | Dates, segments, accommodation |
| 3 | `/generate-estimate` | Cost estimates table |
| 4 | `/submit-to-supervisor` | Review + submit |
| 5 | `/awaiting-supervisor-approval` | Blocked — needs supervisor approval (second window) |
| 6 | `/edit-traveler-details` | Traveller profile |
| 7 | `/submit-travel-desk-form` | Travel desk preferences |
| 8 | `/awaiting-flight-options` | Blocked — travel desk adds options |
| 9 | `/rank-flight-options` | Traveller ranks options |
| 10 | `/awaiting-booking-confirmation` | Blocked — travel desk confirms |
| 11 | `/awaiting-travel-start` | Blocked — must wait until after depart date |
| 12 | `/confirm-actual-travel-details` | Confirm real travel details |
| 13 | `/submit-expenses` | Add expenses, receipts, coding |
| 14 | `/awaiting-expense-claim-approval` | Blocked — supervisor approves expenses |
| 15 | `/awaiting-finance-review` | Blocked — finance reviews |
| 16 | `/review-expenses` | Final review |

All segments are prefixed by `/my-travel-requests/:id/wizard`.

---

## Playwright Porting Notes

When converting this workflow to Playwright:

- **Date fields:** Use `page.fill('[placeholder="YYYY-MM-DD"]', '2026-06-01')` combined with
  `page.dispatchEvent('[placeholder="YYYY-MM-DD"]', 'input')` to trigger Vue reactivity. Or use
  `page.evaluate` to dispatch a native `InputEvent`.
- **Wait for toasts:** `await page.waitForSelector('.v-snackbar:has-text("Travel request saved.")')`.
- **Approval steps:** Use a second `browser.newContext()` logged in as the admin account. The
  admin context can navigate to the travel authorization's admin view and click **Approve**
  there, then the traveller context refreshes via **Check status?**.
- **Combobox/autocomplete selects:** Vuetify comboboxes need a click to open, then click on the
  list item. Use `page.click('[aria-label="From"]')` + `page.click('[role="option"]:has-text("Whitehorse (YT)")')`.
- **Policy-gated buttons:** Edit/Delete buttons are conditionally rendered via `v-if="item.policy.update"`.
  Don't use `waitForSelector` with a timeout if the user lacks permission — check the API response
  `policy.update` field first.
