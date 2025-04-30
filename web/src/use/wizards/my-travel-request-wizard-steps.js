import { isNil } from "lodash"

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
      id: "edit-purpose-details",
      title: "Details: purpose",
      subtitle: "Enter trip purpose",
      component: () => import("@/components/my-travel-request-wizard/EditPurposeDetailsStep.vue"),
    },
    {
      id: "edit-trip-details",
      title: "Details: trip",
      subtitle: "Enter trip details",
      component: () => import("@/components/my-travel-request-wizard/EditTripDetailsStep.vue"),
    },
    {
      id: "generate-estimate",
      title: "Estimate: edit",
      subtitle: "Generate estimate",
      component: () => import("@/components/my-travel-request-wizard/GenerateEstimateStep.vue"),
    },
    {
      id: "submit-to-supervisor",
      title: "Details: submit",
      subtitle: "Submit travel request",
      component: () => import("@/components/my-travel-request-wizard/SubmitToSupervisorStep.vue"),
      continueButtonText: "Submit to Supervisor",
    },
    {
      id: "review-trip-details",
      title: "Details",
      subtitle: "Review submitted trip details",
      component: () => import("@/components/my-travel-request-wizard/ReviewTripDetailsStep.vue"),
      backButtonText: "Revert to Draft",
      backButtonProps: {
        color: "warning",
      },
    },
    {
      id: "review-submitted-estimate",
      title: "Estimate",
      subtitle: "Review submitted estimate",
      component: () =>
        import("@/components/my-travel-request-wizard/ReviewSubmittedEstimateStep.vue"),
    },
    {
      id: "awaiting-supervisor-approval",
      title: "Waiting for approval",
      subtitle: "Travel request is submitted to supervisor and waiting for approval.",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingSupervisorApprovalStep.vue"),
      continueButtonText: "Check status?",
    },

    {
      id: "edit-traveller-details",
      title: "Request: traveller details",
      subtitle: "Enter traveller details",
      component: () => import("@/components/my-travel-request-wizard/EditTravellerDetailsStep.vue"),
    },
    {
      id: "submit-to-travel-desk",
      title: "Request: submit",
      subtitle: "Submit to travel desk",
      component: () => import("@/components/my-travel-request-wizard/SubmitToTravelDeskStep.vue"),
      continueButtonText: "Submit",
    },
    {
      id: "review-request-details",
      title: "Request",
      subtitle: "Review request details",
      component: () => import("@/components/my-travel-request-wizard/ReviewRequestDetailsStep.vue"),
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: "awaiting-flight-options",
      title: "Awaiting flight options",
      subtitle: "Awaiting flight options from travel desk",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingFlightOptionsStep.vue"),
      continueButtonText: "Check status?",
    },
    {
      id: "rank-flight-options",
      title: "Rank options",
      subtitle: "Rank options provided",
      component: () => import("@/components/my-travel-request-wizard/RankFlightOptionsStep.vue"),
      continueButtonText: "Submit Option Rankings",
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: "awaiting-booking-confirmation",
      title: "Waiting for booking",
      subtitle: "Travel request flight options are ranked, waiting for booking confirmation.",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingBookingConfirmationStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: "awaiting-travel-start",
      title: "Awaiting travel start",
      subtitle: "Waiting for travel to start",
      component: () => import("@/components/my-travel-request-wizard/AwaitingTravelStartStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: "confirm-actual-travel-details",
      title: "Confirm actual travel details",
      subtitle: "Confirm actual travel details or record changes from estimate",
      component: () =>
        import("@/components/my-travel-request-wizard/ConfirmActualTravelDetailsStep.vue"),
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: "submit-expenses",
      title: "Expense: edit",
      subtitle: "Submit expenses",
      component: () => import("@/components/my-travel-request-wizard/SubmitExpensesStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Submit to Supervisor",
    },
    {
      id: "review-expenses",
      title: "Expense",
      subtitle: "Review submitted expense",
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
