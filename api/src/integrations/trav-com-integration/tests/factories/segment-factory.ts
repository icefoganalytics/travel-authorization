import { faker } from "@faker-js/faker/locale/en_CA"
import FactoryShark from "factory-shark"

import { TravComIntegration } from "@/integrations"

import { accountsReceivableInvoiceFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-factory"
import { accountsReceivableInvoiceDetailFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-detail-factory"

export const segmentFactory = FactoryShark.define<TravComIntegration.Models.Segment>(
  TravComIntegration.Models.Segment,
  ({ associate, sequence }) => {
    associate("invoice", accountsReceivableInvoiceFactory)
    associate("invoiceDetail", accountsReceivableInvoiceDetailFactory, ({ invoiceId }) => ({
      invoiceId,
    }))

    return {
      id: sequence,
      legNumber: faker.number.int({ min: 1, max: 10 }),
    }
  }
)

export default segmentFactory
