import FactoryShark from "factory-shark"

import { Passenger } from "@/integrations/travel-port-integration/models"

export const passengerFactory = FactoryShark.define(Passenger, ({ sequence }) => {
  return {
    lastNameElement: sequence,
    passengerElement: 1,
  }
})

export default passengerFactory
