import { Includeable } from "@sequelize/core"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravComIntegration } from "@/integrations"
import { nestedSaveAndAssociateIfNew } from "@/integrations/trav-com-integration/tests/factories/helpers"

import BaseFactory from "@/integrations/trav-com-integration/tests/factories/base-factory"
import { accountsReceivableInvoiceFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-factory"
import { accountsReceivableInvoiceDetailFactory } from "@/integrations/trav-com-integration/tests/factories/accounts-receivable-invoice-detail-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class SegmentFactory extends BaseFactory<TravComIntegration.Models.Segment, TransientParam> {}

export const segmentFactory = SegmentFactory.define(
  ({ onCreate, associations, params, transientParams }) => {
    onCreate(async (segment) => {
      try {
        await nestedSaveAndAssociateIfNew(segment)

        if (transientParams.include === undefined) {
          return segment
        }

        return segment.reload({
          include: transientParams.include,
        })
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create Segment with attributes: ${JSON.stringify(segment.dataValues, null, 2)}`
        )
      }
    })

    const invoice =
      associations.invoice ?? accountsReceivableInvoiceFactory.build({ id: params.invoiceId })
    const invoiceDetail =
      associations.invoiceDetail ??
      accountsReceivableInvoiceDetailFactory.build({ id: params.invoiceDetailId })

    const segment = TravComIntegration.Models.Segment.build({
      invoiceId: invoice.id,
      invoiceDetailId: invoiceDetail.id,
      legNumber: faker.number.int({ min: 1, max: 10 }),
    })

    segment.invoice = invoice
    segment.invoiceDetail = invoiceDetail

    return segment
  }
)

export default segmentFactory
