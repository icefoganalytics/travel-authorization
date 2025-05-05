import { CreationAttributes } from "sequelize"
import { isEmpty, isNil, isUndefined } from "lodash"

import db from "@/db/db-client"
import BaseService from "@/services/base-service"

import { Expense, Stop, TravelAuthorization, User } from "@/models"
import { TripTypes as TravelAuthorizationTripTypes } from "@/models/travel-authorization"
import { StopsService, ExpensesService, Stops } from "@/services"

export class UpdateService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private stops?: CreationAttributes<Stop>[]
  private expenses: CreationAttributes<Expense>[]
  private attributes: Partial<TravelAuthorization>
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    { stops, expenses = [], ...attributes }: Partial<TravelAuthorization>,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.attributes = attributes
    this.stops = stops
    this.expenses = expenses
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    return db.transaction(async () => {
      await this.travelAuthorization.update(this.attributes).catch((error) => {
        throw new Error(`Could not update TravelAuthorization: ${error}`)
      })

      const travelAuthorizationId = this.travelAuthorization.id
      const { tripType } = this.travelAuthorization
      if (!isUndefined(this.stops) && !isNil(tripType)) {
        if (!this.isValidStopCount(tripType, this.stops)) {
          throw new Error("Stop count is not valid for trip type.")
        }

        await StopsService.bulkReplace(travelAuthorizationId, this.stops)
        // TODO: remove this once travel segments fully replace stops
        await Stops.BulkConvertStopsToTravelSegmentsService.perform(this.travelAuthorization)
      }

      // TODO: might need to tweak this, or any updates to a travel authorization will
      // blow away all estimates and expenses.
      if (!isEmpty(this.expenses)) {
        await ExpensesService.bulkReplace(travelAuthorizationId, this.expenses)
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

  isValidStopCount(tripType: TravelAuthorizationTripTypes, stops: Partial<Stop>[]): boolean {
    if (tripType === TravelAuthorization.TripTypes.ONE_WAY) {
      return stops.length === 2
    } else if (tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
      return stops.length >= 3
    } else {
      return stops.length === 2
    }
  }
}

export default UpdateService
