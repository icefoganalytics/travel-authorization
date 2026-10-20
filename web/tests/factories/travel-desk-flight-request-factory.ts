import { Factory } from "fishery"

import type { TravelDeskFlightRequest } from "@/api/travel-desk-flight-requests-api"

export const travelDeskFlightRequestFactory = Factory.define<TravelDeskFlightRequest>(
  ({ sequence }) => {
    const timestamp = "2026-10-09T00:00:00.000Z"

    return {
      id: sequence,
      travelRequestId: 1,
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-11-01",
      timePreference: "AM",
      seatPreference: "No Preference",
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }
)

export default travelDeskFlightRequestFactory
