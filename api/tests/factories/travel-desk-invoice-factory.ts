import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskInvoice } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import { travelDeskTravelRequestFactory } from "@/factories/travel-desk-travel-request-factory"

export const travelDeskInvoiceFactory = Factory.define<TravelDeskInvoice>(
  ({ associations, onCreate }) => {
    onCreate(async (invoice) => {
      await nestedSaveAndAssociateIfNew(invoice)
      return invoice
    })

    const travelDeskTravelRequest =
      associations.travelDeskTravelRequest ??
      travelDeskTravelRequestFactory.build({ id: undefined })
    const recordLocator = faker.string.alphanumeric(6).toUpperCase()
    const sourceBookingEventId = faker.number.int({ min: 1, max: 1_000_000 })

    const travelDeskInvoice = TravelDeskInvoice.build({
      travelDeskTravelRequestId: travelDeskTravelRequest.id,
      recordLocator,
      sourceBookingEventId,
      sourceSnapshot: {
        bookingEvent: {
          travelOrderIdentifier: sourceBookingEventId,
          bookingFileVersionNumber: 1,
          eventType: "B",
          recordLocator,
          crsDescription: null,
          databaseTimestamp: "2026-01-01T00:00:00.000Z",
          hostEventTimestamp: null,
          pnrCreationDate: null,
          owningAgencyName: null,
          transactionAgencyName: null,
          transactionAgent: null,
          creatingAgencyIata: null,
          passengers: [],
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: "ZZ",
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: "1001",
              departureDate: "2030-01-01",
              departureTime: "12:00",
              arrivalTime: "14:00",
              changeOfDay: 0,
            },
          ],
          serviceFeeTransaction: null,
        },
        serviceFeeEvents: [],
      },
      currencyCode: "CAD",
      grossAmount: "0.000",
    })

    travelDeskInvoice.travelDeskTravelRequest = travelDeskTravelRequest

    return travelDeskInvoice
  }
)

export default travelDeskInvoiceFactory
