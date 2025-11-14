import { Includeable } from "@sequelize/core"

import { TravComIntegration } from "@/integrations"
import { nestedSaveAndAssociateIfNew } from "@/integrations/trav-com-integration/tests/factories/helpers"

import BaseFactory from "@/integrations/trav-com-integration/tests/factories/base-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class AccountsReceivableInvoiceFactory extends BaseFactory<
  TravComIntegration.Models.AccountsReceivableInvoice,
  TransientParam
> {}

export const accountsReceivableInvoiceFactory = AccountsReceivableInvoiceFactory.define(
  ({ transientParams, onCreate, sequence }) => {
    onCreate(async (invoice) => {
      try {
        await nestedSaveAndAssociateIfNew(invoice)

        if (transientParams.include === undefined) {
          return invoice
        }

        return invoice.reload({
          include: transientParams.include,
        })
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create AccountsReceivableInvoice with attributes: ${JSON.stringify(
            invoice.dataValues,
            null,
            2
          )}`
        )
      }
    })

    return TravComIntegration.Models.AccountsReceivableInvoice.build({
      id: sequence,
      invoiceNumber: sequence.toString().padStart(10, "0"),
    })
  }
)

export default accountsReceivableInvoiceFactory
