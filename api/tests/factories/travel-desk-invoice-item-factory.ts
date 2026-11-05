import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskInvoiceItem } from "@/models"
import { TravelDeskInvoiceItemSaleTypes } from "@/models/travel-desk-invoice-item"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import { travelDeskInvoiceFactory } from "@/factories/travel-desk-invoice-factory"
import { travelDeskProductTypeFactory } from "@/factories/travel-desk-product-type-factory"

export const travelDeskInvoiceItemFactory = Factory.define<TravelDeskInvoiceItem>(
  ({ associations, onCreate }) => {
    onCreate(async (invoiceItem) => {
      await nestedSaveAndAssociateIfNew(invoiceItem)
      return invoiceItem
    })

    const invoice = associations.invoice ?? travelDeskInvoiceFactory.build({ id: undefined })
    const productType =
      associations.productType ?? travelDeskProductTypeFactory.build({ id: undefined })

    const travelDeskInvoiceItem = TravelDeskInvoiceItem.build({
      travelDeskInvoiceId: invoice.id,
      travelDeskProductTypeId: productType.id,
      sourceAirSegmentNumber: null,
      sourceServiceFeeEventId: null,
      passengerName: faker.person.fullName(),
      ticketNumber: null,
      vendor: faker.company.name(),
      description: faker.commerce.productDescription(),
      saleType: TravelDeskInvoiceItemSaleTypes.SALE,
      grossAmount: "0.000",
      position: 0,
    })

    travelDeskInvoiceItem.invoice = invoice
    travelDeskInvoiceItem.productType = productType

    return travelDeskInvoiceItem
  }
)

export default travelDeskInvoiceItemFactory
