import FactoryShark from "factory-shark"

import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"

import { withTravelPortPersistence } from "@/factories/helpers/with-travel-port-persistence"

export const travelOrderEventFactory = withTravelPortPersistence(
  TravelOrderEvent,
  FactoryShark.define(TravelOrderEvent, ({ sequence }) => {
    return {
      travelOrderIdentifier: sequence,
      recordLocator: "SRC001",
      databaseTimestamp: new Date("2030-01-01T12:00:00.000Z"),
    }
  })
)

export default travelOrderEventFactory
