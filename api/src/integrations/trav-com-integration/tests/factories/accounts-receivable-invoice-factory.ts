import { Includeable } from "@sequelize/core"
import FactoryShark from "factory-shark"

import { TravComIntegration } from "@/integrations"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const accountsReceivableInvoiceFactory = FactoryShark.define<
  TravComIntegration.Models.AccountsReceivableInvoice,
  TransientParam
>(TravComIntegration.Models.AccountsReceivableInvoice, ({ transient, afterCreate, sequence }) => {
  afterCreate(async (invoice) => {
    if (transient.include !== undefined) {
      await invoice.reload({ include: transient.include })
    }
  })

  return {
    id: sequence,
    invoiceNumber: sequence.toString().padStart(10, "0"),
  }
})

export default accountsReceivableInvoiceFactory
