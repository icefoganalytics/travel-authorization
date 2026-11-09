import FactoryShark from "factory-shark"

import { TravelDeskFlightOption } from "@/models"
import travelDeskFlightRequestFactory from "@/factories/travel-desk-flight-request-factory"
import userFactory from "@/factories/user-factory"

export const travelDeskFlightOptionFactory = FactoryShark.define(
  TravelDeskFlightOption,
  ({ associate }) => {
    associate("flightRequest", travelDeskFlightRequestFactory)
    associate("traveler", userFactory)

    return {
      cost: "700.00",
      leg: "Whitehorse -> Vancouver",
      duration: "2 hours",
      flightPreferenceOrder: 1,
      additionalInformation: null,
    }
  }
)

export default travelDeskFlightOptionFactory
