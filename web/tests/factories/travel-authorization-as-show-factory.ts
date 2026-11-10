import { Factory } from "fishery"

import {
  type TravelAuthorizationAsShow,
  TravelAuthorizationStatuses,
} from "@/api/travel-authorizations-api"

class TravelAuthorizationAsShowFactory extends Factory<TravelAuthorizationAsShow> {
  submitted() {
    return this.params({
      status: TravelAuthorizationStatuses.SUBMITTED,
      isDraft: false,
      isSubmitted: true,
    })
  }
}

export const travelAuthorizationAsShowFactory = TravelAuthorizationAsShowFactory.define(
  ({ sequence }) => {
    const timestamp = "2026-01-01T00:00:00.000Z"

    return {
      id: sequence,
      userId: sequence,
      createdBy: null,
      purposeId: null,
      preApprovalProfileId: null,
      slug: `travel-authorization-${sequence}`,
      firstName: "Test",
      lastName: "Traveller",
      department: null,
      division: null,
      branch: null,
      unit: null,
      email: `traveller-${sequence}@example.test`,
      mailcode: null,
      daysOffTravelStatusEstimate: null,
      daysOffTravelStatusActual: null,
      dateBackToWorkEstimate: null,
      dateBackToWorkActual: null,
      travelDurationEstimate: null,
      travelDurationActual: null,
      travelAdvance: null,
      eventName: null,
      summary: null,
      benefits: null,
      status: TravelAuthorizationStatuses.DRAFT,
      wizardStepName: null,
      supervisorEmail: null,
      requestChange: null,
      denialReason: null,
      tripTypeEstimate: null,
      tripTypeActual: null,
      travelAdvanceInCents: null,
      allTravelWithinTerritory: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      expenses: [],
      purpose: null,
      stops: [],
      travelDeskTravelRequest: null,
      travelSegments: [],
      user: null,
      isDraft: true,
      isDeleted: false,
      isSubmitted: false,
      isApproved: false,
      isDenied: false,
      isChangeRequested: false,
      isBooked: false,
      isExpenseClaimSubmitted: false,
      isExpenseClaimApproved: false,
      isExpenseClaimTravellerChangesRequested: false,
      isExpenseClaimSupervisorChangesRequested: false,
      isExpenseClaimDenied: false,
      isExpensed: false,
      isTravelDeskDraft: false,
      isTravelDeskSubmitted: false,
      isTravelDeskOptionsProvided: false,
      isTravelDeskOptionsRanked: false,
      isTravelDeskBooked: false,
      isTravelDeskComplete: false,
      isTravellingByAir: false,
      isInFinalState: false,
      isInTravelDeskFlow: false,
    }
  }
)

export default travelAuthorizationAsShowFactory
