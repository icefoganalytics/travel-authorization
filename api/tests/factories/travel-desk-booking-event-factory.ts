import FactoryShark from "factory-shark"

import { TravelDeskBookingEvent } from "@/models"

export const travelDeskBookingEventFactory = FactoryShark.define(
  TravelDeskBookingEvent,
  ({ sequence }) => {
    return {
      externalTravelportIdentifier: sequence,
      recordLocator: "SRC001",
      databaseTimestamp: new Date("2030-01-01T12:00:00.000Z"),
      passengers: [],
      airReservationSegments: [],
      serviceFeeTransaction: null,
    }
  }
)

export default travelDeskBookingEventFactory
