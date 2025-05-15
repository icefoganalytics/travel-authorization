import { Attributes } from "sequelize"
import { isUndefined } from "lodash"

import db from "@/db/db-client"
import BaseService from "@/services/base-service"

import { Expense, Stop, TravelAuthorization, TravelSegment, User } from "@/models"
import { Expenses, TravelSegments } from "@/services"

export type TravelAuthorizationUpdateAttributes = Partial<Attributes<TravelAuthorization>> & {
  stops?: Partial<Attributes<Stop>>[]
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

      const travelAuthorizationId = this.travelAuthorization.id
      const { travelSegmentEstimatesAttributes } = this.attributes
      if (!isUndefined(travelSegmentEstimatesAttributes)) {
        await TravelSegments.BulkReplaceService.perform(
          travelAuthorizationId,
          travelSegmentEstimatesAttributes,
          false
        )
      }

      const { travelSegmentActualsAttributes } = this.attributes
      if (!isUndefined(travelSegmentActualsAttributes)) {
        await TravelSegments.BulkReplaceService.perform(
          travelAuthorizationId,
          travelSegmentActualsAttributes,
          true
        )
      }

      // TODO: might need to tweak this, or any updates to a travel authorization will
      // blow away all estimates and expenses.
      const { expenses } = this.attributes
      if (!isUndefined(expenses)) {
        await Expenses.BulkReplaceService.perform(travelAuthorizationId, expenses)
      }

      return this.travelAuthorization.reload({
        include: [
          "expenses",
          "stops",
          "purpose",
          "user",
          "travelSegments",
          "travelDeskTravelRequest",
        ],
      })
    })
  }
}

export default UpdateService
