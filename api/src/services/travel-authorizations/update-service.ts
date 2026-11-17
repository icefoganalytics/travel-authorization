import { Attributes } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import db from "@/db/db-client"
import BaseService from "@/services/base-service"

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
      await this.travelAuthorization.update(this.attributes).catch((error) => {
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
