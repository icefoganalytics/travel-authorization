import FactoryShark from "factory-shark"

import { Passenger } from "@/integrations/travel-port-integration/models"

import { withTravelPortPersistence } from "@/factories/travel-port-integration/helpers/with-travel-port-persistence"

export const passengerFactory = withTravelPortPersistence(
  Passenger,
  FactoryShark.define(Passenger, ({ sequence }) => {
    return {
      lastNameElement: sequence,
      passengerElement: 1,
    }
  })
)

export default passengerFactory
