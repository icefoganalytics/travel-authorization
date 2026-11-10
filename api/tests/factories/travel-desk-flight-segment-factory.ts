import FactoryShark from "factory-shark"

import { TravelDeskFlightSegment } from "@/models"
import travelDeskFlightOptionFactory from "@/factories/travel-desk-flight-option-factory"

export const travelDeskFlightSegmentFactory = FactoryShark.define(
  TravelDeskFlightSegment,
  ({ associate, sequence }) => {
    associate("flightOption", travelDeskFlightOptionFactory)

    return {
      flightNumber: `YT${sequence}`,
      departAt: new Date("2026-10-27T15:00:00.000Z"),
      departLocation: "Whitehorse",
      arriveAt: new Date("2026-10-27T18:00:00.000Z"),
      arriveLocation: "Vancouver",
      duration: "3 hours",
      status: "Confirmed",
      class: "Economy",
      sortOrder: 1,
    }
  }
)

export default travelDeskFlightSegmentFactory
