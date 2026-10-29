import { Knex } from "knex"

import { TravelOrderEvent } from "@/integrations/travelport-integration/models"

import db from "@/integrations/travelport-integration/db/db-migration-client"

const knex: Knex = db

describe("api/tests/integrations/travelport-integration/models/travel-order-event.test.ts", () => {
  describe("TravelOrderEvent", () => {
    describe("findAllByRecordLocator", () => {
      beforeEach(async () => {
        await knex("Passenger").del()
        await knex("AirRsrvSeg").del()
        await knex("SFTrans").del()
        await knex("TravelOrderEvent").del()
      })

      test("when a locator has B, F, and unversioned T events, it returns distinct linked history", async () => {
        // Arrange
        const recordLocator = "QZ9X2A"
        const bookingIdentifier = 990001
        const fareIdentifier = 990002
        const ticketIdentifier = 990003
        await knex("TravelOrderEvent").insert([
          {
            TravelOrderIdentifier: bookingIdentifier,
            RecordLocator: recordLocator,
            PnrBfVersionNbr: 8,
            EventType: "B",
            DatabaseTimeStamp: "2030-01-01T12:00:00",
          },
          {
            TravelOrderIdentifier: fareIdentifier,
            RecordLocator: recordLocator,
            PnrBfVersionNbr: 7,
            EventType: "F",
            DatabaseTimeStamp: "2030-01-02T12:00:00",
          },
          {
            TravelOrderIdentifier: ticketIdentifier,
            RecordLocator: recordLocator,
            PnrBfVersionNbr: null,
            EventType: "T",
            DatabaseTimeStamp: "2030-01-03T12:00:00",
          },
        ])
        await knex("Passenger").insert([
          {
            TravelOrderIdentifier: bookingIdentifier,
            LastNameElement: 1,
            PassengerElement: 1,
            FirstName: "Ada",
            LastName: "Example",
          },
          {
            TravelOrderIdentifier: bookingIdentifier,
            LastNameElement: 2,
            PassengerElement: 1,
            FirstName: "Grace",
            LastName: "Example",
          },
          {
            TravelOrderIdentifier: fareIdentifier,
            LastNameElement: 1,
            PassengerElement: 1,
            FirstName: "Ada",
            LastName: "Example",
          },
        ])
        await knex("AirRsrvSeg").insert([
          {
            TravelOrderIdentifier: bookingIdentifier,
            AirSegmentNbr: 1,
            SegmentStatus: "GK",
            CarrierCode: "ZZ",
            BoardPoint: "YXY",
            OffPoint: "YVR",
          },
          {
            TravelOrderIdentifier: bookingIdentifier,
            AirSegmentNbr: 2,
            SegmentStatus: "GK",
            CarrierCode: "ZZ",
            BoardPoint: "YVR",
            OffPoint: "YYJ",
          },
          {
            TravelOrderIdentifier: fareIdentifier,
            AirSegmentNbr: 1,
            SegmentStatus: "HK",
            CarrierCode: "YY",
            BoardPoint: "YVR",
            OffPoint: "YXY",
          },
        ])
        await knex("SFTrans").insert({
          TravelOrderIdentifier: ticketIdentifier,
          SFActiveVoidStatus: "A",
          SFCurrencyCode: "CAD",
          ServiceFeeAmount: "42.125",
          RecordLocator: recordLocator,
        })

        // Act
        const events = await TravelOrderEvent.findAllByRecordLocator(recordLocator)

        // Assert
        expect(events).toEqual([
          expect.objectContaining({
            travelOrderIdentifier: bookingIdentifier,
            bookingFileVersionNumber: 8,
            eventType: "B",
            recordLocator,
            passengers: [
              expect.objectContaining({ firstName: "Ada", lastName: "Example" }),
              expect.objectContaining({ firstName: "Grace", lastName: "Example" }),
            ],
            airReservationSegments: [
              expect.objectContaining({ airSegmentNumber: 1, segmentStatus: "GK" }),
              expect.objectContaining({ airSegmentNumber: 2, segmentStatus: "GK" }),
            ],
            serviceFeeTransaction: null,
          }),
          expect.objectContaining({
            travelOrderIdentifier: fareIdentifier,
            bookingFileVersionNumber: 7,
            eventType: "F",
            recordLocator,
            passengers: [expect.objectContaining({ firstName: "Ada", lastName: "Example" })],
            airReservationSegments: [
              expect.objectContaining({ airSegmentNumber: 1, segmentStatus: "HK" }),
            ],
            serviceFeeTransaction: null,
          }),
          expect.objectContaining({
            travelOrderIdentifier: ticketIdentifier,
            bookingFileVersionNumber: null,
            eventType: "T",
            recordLocator,
            passengers: [],
            airReservationSegments: [],
            serviceFeeTransaction: expect.objectContaining({
              activeVoidStatus: "A",
              serviceFeeAmount: "42.125",
              currencyCode: "CAD",
            }),
          }),
        ])
      })

      test("when no event has the requested locator, it returns an empty history", async () => {
        // Arrange
        await knex("TravelOrderEvent").insert({
          TravelOrderIdentifier: 990004,
          RecordLocator: "OTHER1",
          PnrBfVersionNbr: 1,
          EventType: "B",
          DatabaseTimeStamp: "2030-01-04T12:00:00",
        })

        // Act
        const events = await TravelOrderEvent.findAllByRecordLocator("NOPE99")

        // Assert
        expect(events).toEqual([])
      })
    })
  })
})
