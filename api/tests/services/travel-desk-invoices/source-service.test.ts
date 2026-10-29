import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"

import SourceService from "@/services/travel-desk-invoices/source-service"

describe("api/src/services/travel-desk-invoices/source-service.ts", () => {
  describe("SourceService", () => {
    describe(".perform", () => {
      beforeEach(async () => {
        await sourceDatabase("Passenger").del()
        await sourceDatabase("AirRsrvSeg").del()
        await sourceDatabase("SFTrans").del()
        await sourceDatabase("TravelOrderEvent").del()
      })

      test("when fees arrive separately, it preserves source precision without leaking passenger remarks", async () => {
        // Arrange
        await sourceDatabase("TravelOrderEvent").insert([
          {
            TravelOrderIdentifier: 910001,
            RecordLocator: "SRC001",
            PnrBfVersionNbr: 8,
            EventType: "B",
            DatabaseTimeStamp: "2030-01-01T12:00:00",
          },
          {
            TravelOrderIdentifier: 910002,
            RecordLocator: "SRC001",
            PnrBfVersionNbr: null,
            EventType: "T",
            DatabaseTimeStamp: "2030-01-02T12:00:00",
          },
        ])
        await sourceDatabase("Passenger").insert({
          TravelOrderIdentifier: 910001,
          LastNameElement: 1,
          PassengerElement: 1,
          FirstName: "Ada   ",
          LastName: "Example",
          NameRemark: "Private source-only remark",
        })
        await sourceDatabase("AirRsrvSeg").insert({
          TravelOrderIdentifier: 910001,
          AirSegmentNbr: 1,
          SegmentStatus: "GK",
          BoardPoint: "YXY",
          OffPoint: "YVR",
          DepartureDate: "0000-00-00",
          DepartureTime: "00:00",
        })
        await sourceDatabase("SFTrans").insert({
          TravelOrderIdentifier: 910002,
          SFActiveVoidStatus: "A",
          SFCurrencyCode: "CAD",
          ServiceFeeAmount: "42.125",
          SFCommissionAmount: "0.000",
        })

        // Act
        const events = await SourceService.perform("SRC001")

        // Assert
        expect(events).toEqual([
          expect.objectContaining({
            travelOrderIdentifier: 910001,
            bookingFileVersionNumber: 8,
            eventType: "B",
            recordLocator: "SRC001",
            passengers: [
              { lastNameElement: 1, passengerElement: 1, firstName: "Ada", lastName: "Example" },
            ],
            airReservationSegments: [
              expect.objectContaining({
                airSegmentNumber: 1,
                segmentStatus: "GK",
                boardPoint: "YXY",
                offPoint: "YVR",
                departureDate: "0000-00-00",
                departureTime: "00:00",
              }),
            ],
            serviceFeeTransaction: null,
          }),
          expect.objectContaining({
            travelOrderIdentifier: 910002,
            bookingFileVersionNumber: null,
            eventType: "T",
            passengers: [],
            airReservationSegments: [],
            serviceFeeTransaction: {
              activeVoidStatus: "A",
              serviceFeeDocumentNumber: null,
              issueDate: null,
              currencyCode: "CAD",
              serviceFeeAmount: "42.125",
              commissionAmount: expect.stringMatching(/^0(?:\.0{1,3})?$/),
              nameOnServiceFee: null,
              relatedTicketDocumentNumber: null,
              relatedInvoiceNumber: null,
            },
          }),
        ])
      })
    })
  })
})
