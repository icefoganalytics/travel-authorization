import FactoryShark from "factory-shark"

import { ServiceFeeTransaction } from "@/integrations/travel-port-integration/models"

export const serviceFeeTransactionFactory = FactoryShark.define(ServiceFeeTransaction, () => {
  return {}
})

export default serviceFeeTransactionFactory
