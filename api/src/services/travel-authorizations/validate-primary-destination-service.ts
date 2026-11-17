import { isNil } from "lodash"

import { TravelAuthorization, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"

export class ValidatePrimaryDestinationService extends BaseService {
  constructor(protected travelAuthorization: TravelAuthorization) {
    super()
  }

  async perform(): Promise<void> {
    const { travelAuthorization } = this
    const isActual = this.isActual
    const tripType = isActual
      ? (travelAuthorization.tripTypeActual ?? travelAuthorization.tripTypeEstimate)
      : travelAuthorization.tripTypeEstimate
    const destinationId = isActual
      ? travelAuthorization.actualPrimaryDestinationId
      : travelAuthorization.estimatedPrimaryDestinationId
    if (isNil(destinationId)) {
      if (this.isSelectionRequired && tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
        throw new Error("Select a primary destination for the multi-city itinerary before continuing.")
      }

      return
    }

    const hasMatchingArrival = await TravelSegment.findOne({
      where: {
        travelAuthorizationId: travelAuthorization.id,
        isActual,
        arrivalLocationId: destinationId,
      },
    })
    if (isNil(hasMatchingArrival)) {
      throw new Error("Primary destination must match an arrival in the corresponding itinerary.")
    }
  }

  private get isActual(): boolean {
    switch (this.travelAuthorization.status) {
      case TravelAuthorization.Statuses.APPROVED:
      case TravelAuthorization.Statuses.BOOKED:
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED:
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED:
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED:
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED:
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED:
      case TravelAuthorization.Statuses.EXPENSED:
        return true
      default:
        return false
    }
  }

  private get isSelectionRequired(): boolean {
    const { status, wizardStepName } = this.travelAuthorization
    if (isNil(status) || status === TravelAuthorization.Statuses.DRAFT) {
      return (
        !isNil(wizardStepName) &&
        wizardStepName !== TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS &&
        wizardStepName !== TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS
      )
    }

    if (
      status === TravelAuthorization.Statuses.APPROVED ||
      status === TravelAuthorization.Statuses.BOOKED
    ) {
      return (
        wizardStepName === TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES ||
        wizardStepName === TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL ||
        wizardStepName === TravelAuthorization.WizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING ||
        wizardStepName === TravelAuthorization.WizardStepNames.REVIEW_EXPENSES
      )
    }

    return true
  }
}

export default ValidatePrimaryDestinationService
