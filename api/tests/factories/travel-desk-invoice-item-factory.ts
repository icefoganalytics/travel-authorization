import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskInvoiceItem } from "@/models"
import {
  TravelDeskInvoiceItemProductTypes,
  TravelDeskInvoiceItemSaleTypes,
} from "@/models/travel-desk-invoice-item"
import { travelDeskInvoiceFactory } from "@/factories/travel-desk-invoice-factory"

export const travelDeskInvoiceItemFactory = FactoryShark.define(
  TravelDeskInvoiceItem,
  ({ associate }) => {
    associate("invoice", travelDeskInvoiceFactory)

    return {
      productType: TravelDeskInvoiceItemProductTypes.AIR,
      sourceAirSegmentNumber: null,
      sourceServiceFeeEventExternalIdentifier: null,
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
