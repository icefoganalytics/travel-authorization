import { Factory } from "fishery"

import { TravelDeskBookingEvent } from "@/models"

export const travelDeskBookingEventFactory = Factory.define<TravelDeskBookingEvent>(
  ({ sequence, onCreate }) => {
    onCreate((bookingEvent) => bookingEvent.save())

    return TravelDeskBookingEvent.build({
      externalTravelportIdentifier: sequence,
      recordLocator: "SRC001",
      databaseTimestamp: new Date("2030-01-01T12:00:00.000Z"),
      passengers: [],
      airReservationSegments: [],
      serviceFeeTransaction: null,
    })
  }
)

export default travelDeskBookingEventFactory
