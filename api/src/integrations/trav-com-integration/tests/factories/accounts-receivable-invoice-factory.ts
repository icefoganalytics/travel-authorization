import FactoryShark from "factory-shark"

import { TravComIntegration } from "@/integrations"

export const accountsReceivableInvoiceFactory =
  FactoryShark.define<TravComIntegration.Models.AccountsReceivableInvoice>(
    TravComIntegration.Models.AccountsReceivableInvoice,
    ({ sequence }) => {
      return {
        id: sequence,
        invoiceNumber: sequence.toString().padStart(10, "0"),
      }
    }
  )

export default accountsReceivableInvoiceFactory
