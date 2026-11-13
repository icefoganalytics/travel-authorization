import FactoryShark from "factory-shark"

import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"

export const travelOrderEventFactory = FactoryShark.define(TravelOrderEvent, ({ sequence }) => {
  return {
    travelOrderIdentifier: sequence,
    recordLocator: "SRC001",
    databaseTimestamp: new Date("2030-01-01T12:00:00.000Z"),
  }
})

export default travelOrderEventFactory
