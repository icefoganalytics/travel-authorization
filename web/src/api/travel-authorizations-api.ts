import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type ExpenseAsReference } from "@/api/expenses-api"
import { type LocationAsReference } from "@/api/locations-api"
import { type StopAsReference } from "@/api/stops-api"
import { type TravelAuthorizationStateFlags } from "@/api/travel-authorizations-state-flags-api"
import { type TravelDeskTravelRequestAsReference } from "@/api/travel-desk-travel-requests-api"
import { type TravelPurposeAsReference } from "@/api/travel-purposes-api"
import { type TravelSegment, type TravelSegmentAsReference } from "@/api/travel-segments-api"
import { type UserAsReference } from "@/api/users-api"

/** Keep in sync with api/src/models/travel-authorization.ts */
export enum TravelAuthorizationStatuses {
  APPROVED = "approved",
  AWAITING_DIRECTOR_APPROVAL = "awaiting_director_approval",
  BOOKED = "booked",
  CHANGE_REQUESTED = "change_requested",
  DENIED = "denied",
  DRAFT = "draft",
  EXPENSE_CLAIM_SUBMITTED = "expense_claim_submitted",
  EXPENSE_CLAIM_APPROVED = "expense_claim_approved",
  EXPENSE_CLAIM_DENIED = "expense_claim_denied",
  EXPENSED = "expensed",
  SUBMITTED = "submitted",
}

/** @deprecated - prefer enum equivalent `TravelAuthorizationStatuses` */
export const STATUSES = Object.freeze({
  APPROVED: "approved",
  AWAITING_DIRECTOR_APPROVAL: "awaiting_director_approval",
  BOOKED: "booked",
  CHANGE_REQUESTED: "change_requested",
  DENIED: "denied",
  DRAFT: "draft",
  EXPENSE_CLAIM_SUBMITTED: "expense_claim_submitted",
  EXPENSE_CLAIM_APPROVED: "expense_claim_approved",
  EXPENSE_CLAIM_DENIED: "expense_claim_denied",
  EXPENSED: "expensed",
  SUBMITTED: "submitted",
})

/** Keep in sync with api/src/models/travel-authorization.ts */
export enum TravelAuthorizationTripTypes {
  ROUND_TRIP = "round_trip",
  ONE_WAY = "one_way",
  MULTI_CITY = "multi_city",
}

/** @deprecated - prefer enum equivalent `TripTypes` */
export const TRIP_TYPES = Object.freeze({
  ROUND_TRIP: "round_trip",
  ONE_WAY: "one_way",
  MULTI_CITY: "multi_city",
})

export enum TravelAuthorizationWizardStepNames {
  EDIT_PURPOSE_DETAILS = "edit-purpose-details",
  EDIT_TRIP_DETAILS = "edit-trip-details",
  GENERATE_ESTIMATE = "generate-estimate",
  SUBMIT_TO_SUPERVISOR = "submit-to-supervisor",
  AWAITING_SUPERVISOR_APPROVAL = "awaiting-supervisor-approval",
  EDIT_TRAVELLER_DETAILS = "edit-traveller-details",
  SUBMIT_TO_TRAVEL_DESK = "submit-to-travel-desk",
  AWAITING_FLIGHT_OPTIONS = "awaiting-flight-options",
  RANK_FLIGHT_OPTIONS = "rank-flight-options",
  AWAITING_BOOKING_CONFIRMATION = "awaiting-booking-confirmation",
  AWAITING_TRAVEL_START = "awaiting-travel-start",
  CONFIRM_ACTUAL_TRAVEL_DETAILS = "confirm-actual-travel-details",
  SUBMIT_EXPENSES = "submit-expenses",
  AWAITING_EXPENSE_CLAIM_APPROVAL = "awaiting-expense-claim-approval",
  AWAITING_FINANCE_REVIEW_AND_PROCESSING = "awaiting-finance-review-and-processing",
  REVIEW_EXPENSES = "review-expenses",
}

/** @deprecated - prefer enum equivalent `TravelAuthorizationWizardStepNames` */
export const TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES = Object.freeze({
  EDIT_PURPOSE_DETAILS: "edit-purpose-details",
  EDIT_TRIP_DETAILS: "edit-trip-details",
  GENERATE_ESTIMATE: "generate-estimate",
  SUBMIT_TO_SUPERVISOR: "submit-to-supervisor",
  AWAITING_SUPERVISOR_APPROVAL: "awaiting-supervisor-approval",
  EDIT_TRAVELLER_DETAILS: "edit-traveller-details",
  SUBMIT_TO_TRAVEL_DESK: "submit-to-travel-desk",
  AWAITING_FLIGHT_OPTIONS: "awaiting-flight-options",
  RANK_FLIGHT_OPTIONS: "rank-flight-options",
  AWAITING_BOOKING_CONFIRMATION: "awaiting-booking-confirmation",
  AWAITING_TRAVEL_START: "awaiting-travel-start",
  CONFIRM_ACTUAL_TRAVEL_DETAILS: "confirm-actual-travel-details",
  SUBMIT_EXPENSES: "submit-expenses",
  AWAITING_EXPENSE_CLAIM_APPROVAL: "awaiting-expense-claim-approval",
  AWAITING_FINANCE_REVIEW_AND_PROCESSING: "awaiting-finance-review-and-processing",
  REVIEW_EXPENSES: "review-expenses",
})

export type TravelAuthorization = {
  id: number
  userId: number
  createdBy: number | null
  purposeId: number | null
  preApprovalProfileId: number | null
  slug: string
  firstName: string | null
  lastName: string | null
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
  email: string | null
  mailcode: string | null
  daysOffTravelStatusEstimate: number | null
  daysOffTravelStatusActual: number | null
  dateBackToWorkEstimate: string | null
  dateBackToWorkActual: string | null
  travelDurationEstimate: string | null
  travelDurationActual: string | null
  travelAdvance: string | null
  eventName: string | null
  summary: string | null
  benefits: string | null
  status: TravelAuthorizationStatuses
  wizardStepName: TravelAuthorizationWizardStepNames | null
  supervisorEmail: string | null
  requestChange: string | null
  denialReason: string | null
  tripTypeEstimate: TravelAuthorizationTripTypes | null
  tripTypeActual: TravelAuthorizationTripTypes | null
  travelAdvanceInCents: string | null
  allTravelWithinTerritory: boolean | null
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/travel-authorizations/index-serializer.ts */
export type TravelAuthorizationAsIndex = Pick<
  TravelAuthorization,
  "id" | "eventName" | "purposeId" | "wizardStepName" | "status"
> & {
  // Computed properties
  purposeText: string
  departingAt?: string | null
  returningAt?: string | null
  phase?: string
  action?: string[]
  firstName: string | null
  lastName: string | null
  department: string | null
  branch: string | null
  isTravelling: boolean
  unprocessedExpenseCount: number
  // Associations
  finalDestination: LocationAsReference | null
} & TravelAuthorizationStateFlags

/** Keep in sync with api/src/serializers/travel-authorizations/show-serializer.ts */
export type TravelAuthorizationAsShow = Pick<
  TravelAuthorization,
  | "id"
  | "slug"
  | "userId"
  | "preApprovalProfileId"
  | "purposeId"
  | "firstName"
  | "lastName"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "email"
  | "mailcode"
  | "daysOffTravelStatusEstimate"
  | "daysOffTravelStatusActual"
  | "dateBackToWorkEstimate"
  | "dateBackToWorkActual"
  | "travelDurationEstimate"
  | "travelDurationActual"
  | "travelAdvance"
  | "eventName"
  | "summary"
  | "benefits"
  | "status"
  | "wizardStepName"
  | "supervisorEmail"
  | "requestChange"
  | "denialReason"
  | "tripTypeEstimate"
  | "tripTypeActual"
  | "createdBy"
  | "travelAdvanceInCents"
  | "allTravelWithinTerritory"
  | "createdAt"
  | "updatedAt"
> & {
  expenses: ExpenseAsReference[]
  purpose: TravelPurposeAsReference | null
  stops: StopAsReference[]
  travelDeskTravelRequest: TravelDeskTravelRequestAsReference | null
  travelSegments: TravelSegmentAsReference[]
  user: UserAsReference | null
} & TravelAuthorizationStateFlags

export type TravelAuthorizationWhereOptions = WhereOptions<
  TravelAuthorization,
  | "id"
  | "userId"
  | "createdBy"
  | "purposeId"
  | "preApprovalProfileId"
  | "slug"
  | "firstName"
  | "lastName"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "email"
  | "mailcode"
  | "status"
  | "wizardStepName"
  | "supervisorEmail"
  | "tripTypeEstimate"
  | "tripTypeActual"
  | "allTravelWithinTerritory"
>

/** must match model scopes */
export type TravelAuthorizationFiltersOptions = FiltersOptions<{
  isTravelling: void
  isUpcomingTravel: void
  isBeforeTripEnd: void
}>

export type TravelAuthorizationsQueryOptions = QueryOptions<
  TravelAuthorizationWhereOptions,
  TravelAuthorizationFiltersOptions
>

/** Keep in sync with TravelAuthorizationPolicy::permittedAttributes (e.g. api/src/policies/travel-authorizations/draft-state-policy.ts) */
export type TravelAuthorizationCreationAttributes = Partial<TravelAuthorization> & {
  travelSegmentEstimatesAttributes?: Partial<TravelSegment>[]
}

export const travelAuthorizationsApi = {
  STATUSES,
  TRIP_TYPES,
  WIZARD_STEP_NAMES: TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,

  async list(params: TravelAuthorizationsQueryOptions = {}): Promise<{
    travelAuthorizations: TravelAuthorizationAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-authorizations", {
      params,
    })
    return data
  },
  async get(
    travelAuthorizationId: number,
    params: Partial<TravelAuthorization> = {}
  ): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-authorizations/${travelAuthorizationId}`, {
      params,
    })
    return data
  },
  async create(attributes: TravelAuthorizationCreationAttributes): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post("/api/travel-authorizations", attributes)
    return data
  },
  async update(
    travelAuthorizationId: number,
    attributes: TravelAuthorizationCreationAttributes
  ): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.patch(
      `/api/travel-authorizations/${travelAuthorizationId}`,
      attributes
    )
    return data
  },
  async delete(travelAuthorizationId: number): Promise<void> {
    await http.delete(`/api/travel-authorizations/${travelAuthorizationId}`)
  },
  // State Management Actions
  async submit(
    travelAuthorizationId: number,
    attributes: TravelAuthorizationCreationAttributes
  ): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/submit`,
      attributes
    )
    return data
  },
  async revertToDraft(travelAuthorizationId: number): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/revert-to-draft`
    )
    return data
  },
  async approve(travelAuthorizationId: number): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(`/api/travel-authorizations/${travelAuthorizationId}/approve`)
    return data
  },
  async approveExpenseClaim(travelAuthorizationId: number): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/approve-expense-claim`
    )
    return data
  },
  async deny(
    travelAuthorizationId: number,
    attributes: { denialReason?: string } = {}
  ): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/deny`,
      attributes
    )
    return data
  },
  async expenseClaim(
    travelAuthorizationId: number,
    attributes: Partial<TravelAuthorization>
  ): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/expense-claim`,
      attributes
    )
    return data
  },
  async expense(travelAuthorizationId: number): Promise<{
    travelAuthorization: TravelAuthorizationAsShow
  }> {
    const { data } = await http.post(`/api/travel-authorizations/${travelAuthorizationId}/expense`)
    return data
  },
}

export default travelAuthorizationsApi
