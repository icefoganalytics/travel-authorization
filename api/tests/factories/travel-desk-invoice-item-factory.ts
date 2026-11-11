import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskInvoiceItem } from "@/models"
import { TravelDeskInvoiceItemSaleTypes } from "@/models/travel-desk-invoice-item"
import { travelDeskInvoiceFactory } from "@/factories/travel-desk-invoice-factory"
import { travelDeskProductTypeFactory } from "@/factories/travel-desk-product-type-factory"

export const travelDeskInvoiceItemFactory = FactoryShark.define(
  TravelDeskInvoiceItem,
  ({ associate }) => {
    associate("invoice", travelDeskInvoiceFactory)
    associate("productType", travelDeskProductTypeFactory)

    return {
      sourceAirSegmentNumber: null,
      sourceServiceFeeEventId: null,
      passengerName: faker.person.fullName(),
      ticketNumber: null,
      vendor: faker.company.name(),
      description: faker.commerce.productDescription(),
      saleType: TravelDeskInvoiceItemSaleTypes.SALE,
      grossAmount: "0.000",
      position: 0,
    }
  }
)

export default travelDeskInvoiceItemFactory
