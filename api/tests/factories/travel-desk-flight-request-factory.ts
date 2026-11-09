import { Factory } from "fishery"

import { TravelDeskFlightRequest } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskFlightRequestFactory = Factory.define<TravelDeskFlightRequest>(
  ({ associations, onCreate }) => {
    onCreate(async (travelDeskFlightRequest) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskFlightRequest)
        return travelDeskFlightRequest
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskFlightRequest with attributes: ${JSON.stringify(
            travelDeskFlightRequest.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelRequest =
      associations.travelRequest ?? travelDeskTravelRequestFactory.build({ id: undefined })

    const travelDeskFlightRequest = TravelDeskFlightRequest.build({
      travelRequestId: travelRequest.id,
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-10-27",
      timePreference: TravelDeskFlightRequest.TimePreferences.AM,
      seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
    })

    travelDeskFlightRequest.travelRequest = travelRequest
    travelDeskFlightRequest.flightOptions = associations.flightOptions ?? []

    return travelDeskFlightRequest
  }
)

export default travelDeskFlightRequestFactory
