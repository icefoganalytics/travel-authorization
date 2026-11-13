import FactoryShark from "factory-shark"

import { ServiceFeeTransaction } from "@/integrations/travel-port-integration/models"

import { withTravelPortPersistence } from "@/factories/travel-port-integration/helpers/with-travel-port-persistence"

export const serviceFeeTransactionFactory = withTravelPortPersistence(
  ServiceFeeTransaction,
  FactoryShark.define(ServiceFeeTransaction, () => {
    return {}
  })
)

export default serviceFeeTransactionFactory
