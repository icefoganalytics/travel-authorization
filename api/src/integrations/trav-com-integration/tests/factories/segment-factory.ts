import { Includeable } from "@sequelize/core"
import { faker } from "@faker-js/faker/locale/en_CA"
import FactoryShark from "factory-shark"

import { TravComIntegration } from "@/integrations"

import { accountsReceivableInvoiceFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-factory"
import { accountsReceivableInvoiceDetailFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-detail-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const segmentFactory = FactoryShark.define<
  TravComIntegration.Models.Segment,
  TransientParam
>(TravComIntegration.Models.Segment, ({ associate, sequence, transient, afterCreate }) => {
  associate("invoice", accountsReceivableInvoiceFactory)
  associate("invoiceDetail", accountsReceivableInvoiceDetailFactory, ({ invoiceId }) => ({
    invoiceId,
  }))

  afterCreate(async (segment) => {
    if (transient.include !== undefined) {
      await segment.reload({
        include: transient.include,
      })
    }
  })

  return {
    id: sequence,
    legNumber: faker.number.int({ min: 1, max: 10 }),
  }
})

export default segmentFactory
