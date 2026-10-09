import { Knex } from "knex"

// NOTE: current steps and status at time of migration:
// const WIZARD_STEPS = {
//   EDIT_PURPOSE_DETAILS: "edit-purpose-details",
//   EDIT_TRIP_DETAILS: "edit-trip-details",
//   GENERATE_ESTIMATE: "generate-estimate",
//   SUBMIT_TO_SUPERVISOR: "submit-to-supervisor",
//   REVIEW_TRIP_DETAILS: "review-trip-details",
//   REVIEW_SUBMITTED_ESTIMATE: "review-submitted-estimate",
//   AWAITING_SUPERVISOR_APPROVAL: "awaiting-supervisor-approval",
//   EDIT_TRAVELLER_DETAILS: "edit-traveller-details",
//   SUBMIT_TO_TRAVEL_DESK: "submit-to-travel-desk",
//   REVIEW_REQUEST_DETAILS: "review-request-details",
//   AWAITING_FLIGHT_OPTIONS: "awaiting-flight-options",
//   RANK_FLIGHT_OPTIONS: "rank-flight-options",
//   AWAITING_BOOKING_CONFIRMATION: "awaiting-booking-confirmation",
//   AWAITING_TRAVEL_START: "awaiting-travel-start",
//   SUBMIT_EXPENSES: "submit-expenses",
//   REVIEW_EXPENSES: "review-expenses",
// }

// const TRAVEL_AUTHORIZATION_STATUSES = {
//   DRAFT: "draft",
//   SUBMITTED: "submitted",
//   CHANGE_REQUESTED: "change_requested",
//   APPROVED: "approved",
//   BOOKED: "booked",
//   DENIED: "denied",
//   EXPENSE_CLAIM_SUBMITTED: "expense_claim_submitted",
//   EXPENSE_CLAIM_APPROVED: "expense_claim_approved",
//   EXPENSE_CLAIM_DENIED: "expense_claim_denied",
//   EXPENSED: "expensed",
//   AWAITING_DIRECTOR_APPROVAL: "awaiting_director_approval",
//   DELETED: "deleted",
// }

// const TRAVEL_DESK_TRAVEL_REQUEST_STATUSES = {
//   BOOKED: "booked",
//   COMPLETE: "complete",
//   DRAFT: "draft",
//   OPTIONS_PROVIDED: "options_provided",
//   OPTIONS_RANKED: "options_ranked",
//   SUBMITTED: "submitted",
// }

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      wizard_step_name = CASE
      -- Draft States
        WHEN travel_authorizations.status = 'draft'
        AND travel_authorizations.purpose_id IS NULL THEN 'edit-purpose-details'
        WHEN travel_authorizations.status = 'draft'
        AND travel_authorizations.purpose_id IS NOT NULL
        AND NOT EXISTS (
          SELECT
            1
          FROM
            travel_segments
          WHERE
            travel_segments.travel_authorization_id = travel_authorizations.id
        ) THEN 'edit-trip-details'
        WHEN travel_authorizations.status = 'draft'
        AND EXISTS (
          SELECT
            1
          FROM
            travel_segments
          WHERE
            travel_segments.travel_authorization_id = travel_authorizations.id
        )
        AND NOT EXISTS (
          SELECT
            1
          FROM
            expenses
          WHERE
            expenses.travel_authorization_id = travel_authorizations.id
            AND expenses.type = 'Estimate'
        ) THEN 'generate-estimate'
        WHEN travel_authorizations.status = 'draft'
        AND EXISTS (
          SELECT
            1
          FROM
            expenses
          WHERE
            expenses.travel_authorization_id = travel_authorizations.id
            AND expenses.type = 'Estimate'
        ) THEN 'submit-to-supervisor'
        -- Supervisor Review
        WHEN travel_authorizations.status IN ('submitted', 'awaiting_director_approval') THEN 'awaiting-supervisor-approval'
        WHEN travel_authorizations.status = 'change_requested' THEN 'edit-purpose-details'
        WHEN travel_authorizations.status = 'denied' THEN 'review-trip-details'
        -- Approved but No Travel Desk Request
        WHEN travel_authorizations.status = 'approved'
        AND NOT EXISTS (
          SELECT
            1
          FROM
            travel_desk_travel_requests
          WHERE
            travel_desk_travel_requests.travel_authorization_id = travel_authorizations.id
        ) THEN 'edit-traveller-details'
        -- Approved but Travel Desk Request not submitted
        WHEN travel_authorizations.status = 'approved'
        AND EXISTS (
          SELECT
            1
          FROM
            travel_desk_travel_requests
          WHERE
            travel_desk_travel_requests.travel_authorization_id = travel_authorizations.id
            AND travel_desk_travel_requests.status = 'draft'
        ) THEN 'submit-to-travel-desk'
        -- Submitted to Travel Desk (Awaiting Flight Options)
        WHEN travel_authorizations.status = 'approved'
        AND EXISTS (
          SELECT
            1
          FROM
            travel_desk_travel_requests
          WHERE
            travel_desk_travel_requests.travel_authorization_id = travel_authorizations.id
            AND travel_desk_travel_requests.status = 'submitted'
        ) THEN 'awaiting-flight-options'
        -- Flight Options Provided but Not Ranked
        WHEN travel_authorizations.status = 'approved'
        AND EXISTS (
          SELECT
            1
          FROM
            travel_desk_travel_requests
          WHERE
            travel_desk_travel_requests.travel_authorization_id = travel_authorizations.id
            AND travel_desk_travel_requests.status = 'options_provided'
        ) THEN 'rank-flight-options'
        -- Flight Options Ranked but Not Booked
        WHEN travel_authorizations.status = 'approved'
        AND EXISTS (
          SELECT
            1
          FROM
            travel_desk_travel_requests
          WHERE
            travel_desk_travel_requests.travel_authorization_id = travel_authorizations.id
            AND travel_desk_travel_requests.status = 'options_ranked'
        ) THEN 'awaiting-booking-confirmation'
        -- Catch-all for Approved Travel
        WHEN travel_authorizations.status = 'approved' THEN 'review-trip-details'
        -- Travel Booked
        WHEN travel_authorizations.status = 'booked' THEN 'awaiting-travel-start'
        -- Expense Submission
        WHEN travel_authorizations.status = 'expensed' THEN 'submit-expenses'
        WHEN travel_authorizations.status = 'expense_claim_submitted' THEN 'review-expenses'
        WHEN travel_authorizations.status = 'expense_claim_approved' THEN 'review-expenses'
        WHEN travel_authorizations.status = 'expense_claim_denied' THEN 'submit-expenses'
        ELSE 'UNKNOWN'
      END
  `)
}

export async function down(_knex: Knex): Promise<void> {
  // no-op
}
