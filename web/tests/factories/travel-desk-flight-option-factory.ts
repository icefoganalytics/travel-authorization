import { Factory } from "fishery"

import type { TravelDeskFlightOption } from "@/api/travel-desk-flight-options-api"

export const travelDeskFlightOptionFactory = Factory.define<TravelDeskFlightOption>(
  ({ sequence }) => {
    const timestamp = "2026-10-09T00:00:00.000Z"

    return {
      id: sequence,
      flightRequestId: 1,
      travelerId: 1,
      cost: "300.00",
      leg: "1",
      duration: "2h 30m",
      flightPreferenceOrder: null,
      additionalInformation: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }
)

export default travelDeskFlightOptionFactory
