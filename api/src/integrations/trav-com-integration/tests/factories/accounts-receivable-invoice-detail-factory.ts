import { faker } from "@faker-js/faker/locale/en_CA"
import FactoryShark from "factory-shark"

import { TravComIntegration } from "@/integrations"

import { accountsReceivableInvoiceFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-factory"

export const accountsReceivableInvoiceDetailFactory =
  FactoryShark.define<TravComIntegration.Models.AccountsReceivableInvoiceDetail>(
    TravComIntegration.Models.AccountsReceivableInvoiceDetail,
    ({ associate, sequence }) => {
      associate("invoice", accountsReceivableInvoiceFactory)

      return {
        id: sequence,
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
      }
    }
  )

export default accountsReceivableInvoiceDetailFactory
