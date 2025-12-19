import { isNil } from "lodash"
import { type AsyncComponent } from "vue"

import { type VBtn } from "vuetify/lib/components"

import { TravelAuthorizationWizardStepNames } from "@/api/travel-authorizations-api"

export type WizardStep = {
  id: TravelAuthorizationWizardStepNames
  title: string
  subtitle: string
  component: AsyncComponent
  continueButtonText?: string
  continueButtonProps?: VBtn["props"]
  backButtonText?: string
  backButtonProps?: VBtn["props"]
  editable: boolean
}

export function buildStep(wizardStepAttributes: Partial<WizardStep>): WizardStep {
  const { id, title, subtitle, component, editable, ...optionalAttributes } = wizardStepAttributes

  if (isNil(id)) {
    throw new Error("id is required")
  }

  if (isNil(title)) {
    throw new Error("title is required")
  }

  if (isNil(subtitle)) {
    throw new Error("subtitle is required")
  }

  if (isNil(component)) {
    throw new Error("component is required")
  }

  const editableOrDefault = editable ?? false

  return {
    ...optionalAttributes,
    id,
    title,
    subtitle,
    component,
    editable: editableOrDefault,
  }
}

export const MY_TRAVEL_REQUEST_WIZARD_STEPS = Object.freeze(
  [
    {
      id: TravelAuthorizationWizardStepNames.EDIT_PURPOSE_DETAILS,
      title: "Trip Purpose",
      subtitle: "Enter trip purpose",
      component: () => import("@/components/my-travel-request-wizard/EditPurposeDetailsStep.vue"),
    },
    {
      id: TravelAuthorizationWizardStepNames.EDIT_TRIP_DETAILS,
      title: "Trip Details",
      subtitle: "Enter trip details",
      component: () => import("@/components/my-travel-request-wizard/EditTripDetailsStep.vue"),
    },
    {
      id: TravelAuthorizationWizardStepNames.GENERATE_ESTIMATE,
      title: "Trip Estimates",
      subtitle: "Generate estimate",
      component: () => import("@/components/my-travel-request-wizard/GenerateEstimateStep.vue"),
    },
    {
      id: TravelAuthorizationWizardStepNames.SUBMIT_TO_SUPERVISOR,
      title: "Submit Travel Request",
      subtitle: "Submit travel request",
      component: () => import("@/components/my-travel-request-wizard/SubmitToSupervisorStep.vue"),
      continueButtonText: "Submit to Supervisor",
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_SUPERVISOR_APPROVAL,
      title: "Waiting for Approval",
      subtitle: "Travel request is submitted to supervisor and waiting for approval",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingSupervisorApprovalStep.vue"),
      continueButtonText: "Check status?",
      backButtonText: "Revert to Draft",
      backButtonProps: {
        color: "warning",
      },
    },

    {
      id: TravelAuthorizationWizardStepNames.EDIT_TRAVELLER_DETAILS,
      title: "Traveler Details",
      subtitle: "Enter traveller details",
      component: () => import("@/components/my-travel-request-wizard/EditTravellerDetailsStep.vue"),
    },
    {
      id: TravelAuthorizationWizardStepNames.SUBMIT_TO_TRAVEL_DESK,
      title: "Submit to Travel Desk",
      subtitle: "Submit to travel desk",
      component: () => import("@/components/my-travel-request-wizard/SubmitToTravelDeskStep.vue"),
      continueButtonText: "Submit",
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_FLIGHT_OPTIONS,
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
      id: TravelAuthorizationWizardStepNames.RANK_FLIGHT_OPTIONS,
      title: "Rank options",
      subtitle: "Rank options provided",
      component: () => import("@/components/my-travel-request-wizard/RankFlightOptionsStep.vue"),
      continueButtonText: "Submit Option Rankings",
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_BOOKING_CONFIRMATION,
      title: "Waiting for Booking",
      subtitle: "Travel request flight options are ranked, waiting for booking confirmation",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingBookingConfirmationStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_TRAVEL_START,
      title: "Awaiting Travel Start",
      subtitle: "Waiting for travel to start",
      component: () => import("@/components/my-travel-request-wizard/AwaitingTravelStartStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TravelAuthorizationWizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS,
      title: "Confirm Actual Travel Details",
      subtitle: "Confirm actual travel details or record changes from estimate",
      component: () =>
        import("@/components/my-travel-request-wizard/ConfirmActualTravelDetailsStep.vue"),
      backButtonProps: {
        disabled: true,
      },
    },
    {
      id: TravelAuthorizationWizardStepNames.SUBMIT_EXPENSES,
      title: "Submit Expenses",
      subtitle: "Submit trip expenses and receipts to your supervisor",
      component: () => import("@/components/my-travel-request-wizard/SubmitExpensesStep.vue"),
      continueButtonText: "Submit to Supervisor",
      continueButtonProps: {
        disabled: true,
        tooltipText: "Cannot submit expenses until travel is completed",
      },
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
      title: "Awaiting Supervisor Approval",
      subtitle: "Expense claim is submitted to supervisor and waiting for approval",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingExpenseClaimApprovalStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TravelAuthorizationWizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
      title: "Awaiting Finance Review and Processing",
      subtitle: "Supervisor approved, waiting for finance to review and process",
      component: () =>
        import("@/components/my-travel-request-wizard/AwaitingFinanceReviewAndProcessingStep.vue"),
      backButtonProps: {
        disabled: true,
      },
      continueButtonText: "Check status?",
    },
    {
      id: TravelAuthorizationWizardStepNames.REVIEW_EXPENSES,
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
