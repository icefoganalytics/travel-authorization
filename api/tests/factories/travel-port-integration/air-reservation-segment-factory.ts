import FactoryShark from "factory-shark"

import { AirReservationSegment } from "@/integrations/travel-port-integration/models"

import { withTravelPortPersistence } from "@/factories/travel-port-integration/helpers/with-travel-port-persistence"

export const airReservationSegmentFactory = withTravelPortPersistence(
  AirReservationSegment,
  FactoryShark.define(AirReservationSegment, ({ sequence }) => {
    return {
      airSegmentNumber: sequence,
    }
  })
)

export default airReservationSegmentFactory
