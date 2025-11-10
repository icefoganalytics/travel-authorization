import { Includeable } from "@sequelize/core"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravComIntegration } from "@/integrations"
import { nestedSaveAndAssociateIfNew } from "@/integrations/trav-com-integration/tests/factories/helpers"

import BaseFactory from "@/integrations/trav-com-integration/tests/factories/base-factory"
import { accountsReceivableInvoiceFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class AccountsReceivableInvoiceDetailFactory extends BaseFactory<
  TravComIntegration.Models.AccountsReceivableInvoiceDetail,
  TransientParam
> {}

export const accountsReceivableInvoiceDetailFactory = AccountsReceivableInvoiceDetailFactory.define(
  ({ onCreate, associations, params, sequence, transientParams }) => {
    onCreate(async (detail) => {
      try {
        await nestedSaveAndAssociateIfNew(detail)

        if (transientParams.include === undefined) {
          return detail
        }

        return detail.reload({
          include: transientParams.include,
        })
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create AccountsReceivableInvoiceDetail with attributes: ${JSON.stringify(detail.dataValues, null, 2)}`
        )
      }
    })

    const invoice =
      associations.invoice ??
      accountsReceivableInvoiceFactory.build({
        id: params.invoiceId,
      })

    const detail = TravComIntegration.Models.AccountsReceivableInvoiceDetail.build({
      id: sequence,
      invoiceId: invoice.id,
      transactionType: faker.number.int({ min: 1, max: 10 }),
      vendorNumber: faker.string.numeric(3),
      vendorName: faker.company.name(),
      productCode: faker.number.int({ min: 1, max: 20 }),
      passengerName: faker.person.fullName().toUpperCase(),
      ticketNumber: faker.string.numeric(6),
      publishedFare: faker.number.float({ min: 0, max: 1000, precision: 2 }),
      sellingFare: faker.number.float({ min: 0, max: 1000, precision: 2 }),
      referenceFare: faker.number.float({ min: 0, max: 1000, precision: 2 }),
      lowFare: faker.number.float({ min: 0, max: 1000, precision: 2 }),
      tax1: faker.number.float({ min: 0, max: 200, precision: 2 }),
      grossAmount: faker.number.float({ min: 0, max: 1200, precision: 2 }),
      commissionAmount: faker.number.float({ min: 0, max: 100, precision: 2 }),
      vatOnCommission: faker.number.float({ min: 0, max: 20, precision: 2 }),
      addedBy: faker.number.int({ min: 1, max: 100 }),
    })

    detail.invoice = invoice

    return detail
  }
)

export default accountsReceivableInvoiceDetailFactory
