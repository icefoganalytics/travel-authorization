---
description: Prepare and verify traveler rankings in the existing Travel Desk flight-request view
---

# Test Traveller Flight Rankings

Use this scenario to verify that Travel Desk staff can find the traveler's submitted preferences
without discovering an unlabeled expandable row or opening a duplicate rankings section.

## Prerequisites

1. Run the relevant web checks using the canonical commands in [bin/README.md](../../bin/README.md#testing).
2. Start the intended checkout through `./bin/dev up` and use the browser hostname printed by Vite.
3. Use the configured traveler and administrator accounts from the
   [test-request workflow](create-test-travel-request-workflow.md#accounts--urls).
   Follow that workflow through Step 10 to create, approve, and submit a round-trip air-travel request,
   provide options, and submit the traveler's rankings. Use the test data below.

Create and edit records through the application UI. Keep credentials, browser profiles, screenshots,
and generated automation files out of the repository. Record this run's identifiers and evidence in
the PR or handoff, not in this reusable procedure.

## Test Data

Use a recognizable fictional trip purpose and two flight requests, such as Whitehorse to Vancouver
and the return journey. Give each alternative a distinct flight number and cost so page changes
can be recognized independently of the displayed rank.

| Flight request | Alternatives | Preferences in creation order              |
| -------------- | ------------ | ------------------------------------------ |
| Outbound       | Six          | `1`, **Does Not Work**, `2`, `3`, `4`, `5` |
| Return         | Two          | `2`, `1`                                   |

For the rejected outbound option, enter a recognizable **Additional Information** explanation such
as `Arrives too late for the meeting.` The default page size is five, so the sixth outbound option
must be reachable on page two. A rank is a preference, not the option's position or flight number.

Keep the Travel Auth ID and Travel Desk request ID separately. Use the IDs shown by this run's
screens and URLs; do not assume they match or reuse an ID from a previous session.

## Review Checks

Sign in as the administrator and open the prepared request through **Travel Desk** → **Edit**.

1. Open **5. Review and Manage Booking**. Verify **View Flight Options and Rankings** is the entry
   point and there is no separate rankings collection on this page.
2. Follow that link. Verify **2. Travel Request (Booking)** opens at `#flight-requests`, with the
   **2. Flight Requests** heading visible below the application bar.
3. Click **View Options and Rankings** for the outbound row. Verify the first five alternatives
   show their saved, read-only **Preference**, **Cost**, and flight details. The rejected option
   must show **Does Not Work** and the exact explanation submitted by the traveler.
4. Select page **2**. Verify the sixth alternative's flight number, cost, and preference `5` appear;
   the first-page alternatives must not remain visible or be sliced away a second time.
5. Refresh. Verify the outbound row remains expanded on page **2**. The URL should retain
   `expandTravelDeskFlightRequest=<outbound-id>` and `pageFlightOptions<outbound-id>=2`.
6. Click **View Options and Rankings** for the return row. Verify its two saved preferences are
   `2` and `1`. Switch back to the outbound row and verify its page **2** selection is retained.
7. Click **Hide Options and Rankings**. Verify the alternatives disappear and the control returns
   to **View Options and Rankings**. Reopen it and verify its saved page is retained.
8. At phone width, verify the entry link and option pager fit the document. The flight-request table
   may use its normal internal horizontal scrolling; the document itself must not overflow.

The warning to upload a passenger name record (PNR) with an invoice number is expected at this
stage. Do not mark the booking complete just to review rankings.

## Focused Boundary Checks

Use disposable options belonging only to this QA request:

- Before the traveler assigns preferences, the administrator's existing options view should show
  **Not Ranked** rather than a numeric rank or rejection. This is a separate pre-submission state,
  not one of the completed rankings above.
- Set `perPageFlightOptions<flight-request-id>=3` in the booking URL. Verify three options per page
  and the corresponding page count survive refresh. Restore the default after the check.
- Open a saved URL with `pageFlightOptions<flight-request-id>=-2` and
  `perPageFlightOptions<flight-request-id>=0`. Verify valid default pagination, loaded options, and a
  finite pager. A page size above the API limit of `1000` should also recover to the caller's default.
- On a separate disposable later-page collection, remove enough options through the flight workspace
  to invalidate that page. Reopen its saved URL and verify the last available page, not a false empty
  state. Do not delete the main scenario's alternatives while another reviewer needs them.

The [iterator regressions](../../web/tests/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.test.ts),
[request-race regressions](../../web/tests/use/use-travel-desk-flight-options.test.ts), and
[URL-boundary regressions](../../web/tests/use/utils/use-route-query-pagination.test.ts) cover the
corresponding deterministic cases. A fixture test is not proof of real provider login or a submitted
traveler-to-Travel-Desk workflow.

## Handoff

Leave the booking unfinalized and preserve its test data while review is in progress. Report the
Travel Auth number, Travel Desk review URL, exercised browser and checks, and any unverified cases.
Clean up only owned temporary automation sessions and files; do not remove another reviewer's data
or close their personal browser.
