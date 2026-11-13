import FactoryShark from "factory-shark"

import { AirReservationSegment } from "@/integrations/travel-port-integration/models"

export const airReservationSegmentFactory = FactoryShark.define(
  AirReservationSegment,
  ({ sequence }) => {
    return {
      airSegmentNumber: sequence,
    }
  }
)

export default airReservationSegmentFactory
