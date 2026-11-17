import { Attributes } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import db from "@/db/db-client"
import BaseService from "@/services/base-service"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"
import { ValidatePrimaryDestinationService } from "@/services/travel-authorizations/validate-primary-destination-service"
import { ReconcilePrimaryDestinationService } from "@/services/travel-authorizations/reconcile-primary-destination-service"

import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import { TravelAuthorizationTripTypes } from "@/models/travel-authorization"
import { Expenses, TravelSegments } from "@/services"

export type TravelAuthorizationUpdateAttributes = Partial<Attributes<TravelAuthorization>> & {
  expenses?: Partial<Attributes<Expense>>[]
  travelSegmentEstimatesAttributes?: Partial<Attributes<TravelSegment>>[]
  travelSegmentActualsAttributes?: Partial<Attributes<TravelSegment>>[]
}

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected attributes: TravelAuthorizationUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorization> {
    return db.transaction(async () => {
      this.travelAuthorization = await TravelAuthorization.findByPk(this.travelAuthorization.id, {
        rejectOnEmpty: true,
        lock: true,
      })
      if (
        this.travelAuthorization.status ===
        TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
      ) {
        const policy = new TravelAuthorizationsPolicy(this.currentUser, this.travelAuthorization)
        if (
          !policy.update() ||
          Object.keys(this.attributes).some((key) => key !== "actualPrimaryDestinationId")
        ) {
          throw new Error(
            "Only the owner or an administrator may correct the actual primary destination on a returned claim."
          )
        }
      }

      const isEstimateBecomingMultiCity =
        this.travelAuthorization.tripTypeEstimate !== TravelAuthorization.TripTypes.MULTI_CITY &&
        this.attributes.tripTypeEstimate === TravelAuthorization.TripTypes.MULTI_CITY
      const isActualBecomingMultiCity =
        this.travelAuthorization.tripTypeActual !== TravelAuthorization.TripTypes.MULTI_CITY &&
        this.attributes.tripTypeActual === TravelAuthorization.TripTypes.MULTI_CITY

      const attributes = { ...this.attributes }
      if (isEstimateBecomingMultiCity && isUndefined(attributes.estimatedPrimaryDestinationId)) {
        attributes.estimatedPrimaryDestinationId = null
      }
      if (isActualBecomingMultiCity && isUndefined(attributes.actualPrimaryDestinationId)) {
        attributes.actualPrimaryDestinationId = null
      }

      // Validate explicit selections after nested itineraries have been replaced.
      const { estimatedPrimaryDestinationId, actualPrimaryDestinationId, ...ordinaryAttributes } =
        attributes
      await this.travelAuthorization.update(ordinaryAttributes).catch((error) => {
        throw new Error(`Could not update TravelAuthorization: ${error}`)
      })

      const { travelSegmentEstimatesAttributes } = this.attributes
      if (!isUndefined(travelSegmentEstimatesAttributes)) {
        await this.createdNestedTravelSegments(
          this.travelAuthorization.id,
          this.travelAuthorization.tripTypeEstimate,
          travelSegmentEstimatesAttributes,
          { isActual: false }
        )
      }

      const { travelSegmentActualsAttributes } = this.attributes
      if (!isUndefined(travelSegmentActualsAttributes)) {
        await this.createdNestedTravelSegments(
          this.travelAuthorization.id,
          this.travelAuthorization.tripTypeActual,
          travelSegmentActualsAttributes,
          { isActual: true }
        )
      }

      // TODO: might need to tweak this, or any updates to a travel authorization will
      // blow away all estimates and expenses.
      const { expenses } = this.attributes
      if (!isUndefined(expenses)) {
        await Expenses.BulkReplaceService.perform(this.travelAuthorization.id, expenses)
      }

      await this.travelAuthorization.reload()
      if (!isUndefined(attributes.tripTypeEstimate)) {
        await ReconcilePrimaryDestinationService.perform(this.travelAuthorization, false)
      }
      if (!isUndefined(attributes.tripTypeActual)) {
        await ReconcilePrimaryDestinationService.perform(this.travelAuthorization, true)
      }

      if (!isUndefined(estimatedPrimaryDestinationId)) {
        this.travelAuthorization.estimatedPrimaryDestinationId = estimatedPrimaryDestinationId
      }
      if (!isUndefined(actualPrimaryDestinationId)) {
        this.travelAuthorization.actualPrimaryDestinationId = actualPrimaryDestinationId
      }
      await ValidatePrimaryDestinationService.perform(this.travelAuthorization)
      await this.travelAuthorization.save()

      return this.travelAuthorization.reloadWithScope("asShow")
    })
  }

  private async createdNestedTravelSegments(
    travelAuthorizationId: number,
    tripType: TravelAuthorizationTripTypes | null,
    travelSegmentAttributes: Partial<Attributes<TravelSegment>>[],
    {
      isActual,
    }: {
      isActual: boolean
    }
  ) {
    if (isNil(tripType)) {
      throw new Error("Trip type is required to create travel segments.")
    }

    const travelSegmentCount = travelSegmentAttributes.length
    if (tripType === TravelAuthorization.TripTypes.ONE_WAY && travelSegmentCount !== 1) {
      throw new Error("One way trip must have exactly one travel segment.")
    } else if (tripType === TravelAuthorization.TripTypes.ROUND_TRIP && travelSegmentCount !== 2) {
      throw new Error("Round trip must have exactly two travel segments.")
    } else if (tripType === TravelAuthorization.TripTypes.MULTI_CITY && travelSegmentCount < 2) {
      throw new Error("Multi-city trip must have at least two travel segments.")
    }

    await TravelSegments.BulkReplaceService.perform(
      travelAuthorizationId,
      travelSegmentAttributes,
      isActual
    )
  }
}

export default UpdateService
