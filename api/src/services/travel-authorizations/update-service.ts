import { CreationAttributes } from "sequelize"
import { isEmpty, isUndefined } from "lodash"

import db from "@/db/db-client"
import BaseService from "@/services/base-service"

import { Expense, Stop, TravelAuthorization, User } from "@/models"
import { StopsService, ExpensesService, Stops } from "@/services"

type StopsCreationAttributes = CreationAttributes<Stop>[]

export class UpdateService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private stops: StopsCreationAttributes
  private expenses: CreationAttributes<Expense>[]
  private attributes: Partial<TravelAuthorization>
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    { stops = [], expenses = [], ...attributes }: Partial<TravelAuthorization>,
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
    if (!this.isValidStopCount(this.attributes, this.stops)) {
      throw new Error("Stop count is not valid for trip type.")
    }

    return db.transaction(async () => {
      await this.travelAuthorization.update(this.attributes).catch((error) => {
        throw new Error(`Could not update TravelAuthorization: ${error}`)
      })

      const travelAuthorizationId = this.travelAuthorization.id
      if (!isEmpty(this.stops)) {
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

  isValidStopCount(attributes: Partial<TravelAuthorization>, stops: Partial<Stop>[]): boolean {
    if (isUndefined(attributes.tripType) && isEmpty(stops)) {
      return true
    }

    if (attributes.tripType === TravelAuthorization.TripTypes.ONE_WAY) {
      return stops.length === 2
    } else if (attributes.tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
      return stops.length >= 3
    } else {
      return stops.length === 2
    }
  }
}

export default UpdateService
