import FactoryShark from "factory-shark"

import { TravelDeskFlightRequest } from "@/models"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskFlightRequestFactory = FactoryShark.define(
  TravelDeskFlightRequest,
  ({ associate }) => {
    associate("travelRequest", travelDeskTravelRequestFactory)

    return {
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-10-27",
      timePreference: TravelDeskFlightRequest.TimePreferences.AM,
      seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
    }
  }
)

export default travelDeskFlightRequestFactory
