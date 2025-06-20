import { isNil } from "lodash"

import { TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES } from "@/api/travel-authorizations-api"

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   subtitle: string;
 *   component: () => import("*.vue");
 *   continueButtonText?: string;
 *   continueButtonProps?: import("vuetify/lib/VBtn").VBtn;
 *   backButtonText?: string;
 *   backButtonProps?: import("vuetify/lib/VBtn").VBtn;
 *   editable: boolean;
 * }} WizardStep
 */

/**
 * @param {Partial<WizardStep>} options
 * @returns {WizardStep}
 */
export function buildStep(options) {
  if (isNil(options.id)) {
    throw new Error("id is required")
  }

  if (isNil(options.title)) {
    throw new Error("title is required")
  }

  if (isNil(options.subtitle)) {
    throw new Error("subtitle is required")
  }

  if (isNil(options.component)) {
    throw new Error("component is required")
  }

  return {
    editable: false,
    ...options,
  }
}

/**
 *
 * @returns {
 *   id: string
 * }
 */
export const MY_TRAVEL_REQUEST_WIZARD_STEPS = Object.freeze(
  [
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.EDIT_PURPOSE_DETAILS,
      title: "Trip Purpose",
      subtitle: "Enter trip purpose",
      component: () => import("@/components/my-travel-request-wizard/EditPurposeDetailsStep.vue"),
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.EDIT_TRIP_DETAILS,
      title: "Trip Details",
      subtitle: "Enter trip details",
      component: () => import("@/components/my-travel-request-wizard/EditTripDetailsStep.vue"),
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.GENERATE_ESTIMATE,
      title: "Trip Estimates",
      subtitle: "Generate estimate",
      component: () => import("@/components/my-travel-request-wizard/GenerateEstimateStep.vue"),
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.SUBMIT_TO_SUPERVISOR,
      title: "Submit Travel Request",
      subtitle: "Submit travel request",
      component: () => import("@/components/my-travel-request-wizard/SubmitToSupervisorStep.vue"),
      continueButtonText: "Submit to Supervisor",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.AWAITING_SUPERVISOR_APPROVAL,
      title: "Waiting for Approval",
      subtitle: "Travel request is submitted to supervisor and waiting for approval.",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingSupervisorApprovalStep.vue"),
      continueButtonText: "Check status?",
      backButtonText: "Revert to Draft",
      backButtonProps: {
        color: "warning",
      },
    },

    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.EDIT_TRAVELLER_DETAILS,
      title: "Traveler Details",
      subtitle: "Enter traveller details",
      component: () => import("@/components/my-travel-request-wizard/EditTravellerDetailsStep.vue"),
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.SUBMIT_TO_TRAVEL_DESK,
      title: "Submit to Travel Desk",
      subtitle: "Submit to travel desk",
      component: () => import("@/components/my-travel-request-wizard/SubmitToTravelDeskStep.vue"),
      continueButtonText: "Submit",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.AWAITING_FLIGHT_OPTIONS,
      title: "Awaiting Flight Options",
      subtitle: "Awaiting flight options from travel desk",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingFlightOptionsStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.RANK_FLIGHT_OPTIONS,
      title: "Rank options",
      subtitle: "Rank options provided",
      component: () => import("@/components/my-travel-request-wizard/RankFlightOptionsStep.vue"),
      continueButtonText: "Submit Option Rankings",
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.AWAITING_BOOKING_CONFIRMATION,
      title: "Waiting for Booking",
      subtitle: "Travel request flight options are ranked, waiting for booking confirmation.",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingBookingConfirmationStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.AWAITING_TRAVEL_START,
      title: "Awaiting Travel Start",
      subtitle: "Waiting for travel to start",
      component: () => import("@/components/my-travel-request-wizard/AwaitingTravelStartStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.CONFIRM_ACTUAL_TRAVEL_DETAILS,
      title: "Confirm Actual Travel Details",
      subtitle: "Confirm actual travel details or record changes from estimate",
      component: () =>
        import("@/components/my-travel-request-wizard/ConfirmActualTravelDetailsStep.vue"),
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.SUBMIT_EXPENSES,
      title: "Submit Expenses",
      subtitle: "Submit trip expenses and receipts to your supervisor",
      component: () => import("@/components/my-travel-request-wizard/SubmitExpensesStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Submit to Supervisor",
      continueButtonProps: {
        disabled: true,
        tooltipText: "Cannot submit expenses until travel is completed",
      },
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.AWAITING_EXPENSE_CLAIM_APPROVAL_AND_PROCESSING,
      title: "Awaiting Expense Claim Approval and Processing",
      subtitle: "Expense claim is submitted to supervisor and waiting for approval.",
      component: () =>
        import(
          "@/components/my-travel-request-wizard/AwaitingExpenseClaimApprovalAndProcessing.vue"
        ),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.REVIEW_EXPENSES,
      title: "Review Expenses",
      subtitle: "Review submitted expenses",
      component: () => import("@/components/my-travel-request-wizard/ReviewExpensesStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Return to My Travel Requests",
    },
  ].map(buildStep)
)

export const FIRST_STEP_ID = MY_TRAVEL_REQUEST_WIZARD_STEPS[0].id

export default MY_TRAVEL_REQUEST_WIZARD_STEPS
