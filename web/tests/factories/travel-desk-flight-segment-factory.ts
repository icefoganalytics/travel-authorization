import { Factory } from "fishery"

import type { TravelDeskFlightSegment } from "@/api/travel-desk-flight-segments-api"

export const travelDeskFlightSegmentFactory = Factory.define<TravelDeskFlightSegment>(
  ({ sequence }) => {
    const timestamp = "2026-11-01T00:00:00.000Z"

    return {
      id: sequence,
      flightOptionId: 1,
      flightNumber: "4N101",
      departAt: "2026-12-02T06:25:00.000Z",
      departLocation: "YXY",
      arriveAt: "2026-12-02T08:00:00.000Z",
      arriveLocation: "YDA",
      duration: "01:35",
      status: "Confirmed",
      class: "Economy",
      sortOrder: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }
)

export default travelDeskFlightSegmentFactory
