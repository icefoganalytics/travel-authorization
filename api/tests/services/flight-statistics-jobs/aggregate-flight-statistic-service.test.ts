import AggregateFlightStatisticService from "@/services/flight-statistics-jobs/aggregate-flight-statistic-service"

import { flightStatisticFactory } from "@/factories"
import {
  accountsReceivableInvoiceFactory,
  accountsReceivableInvoiceDetailFactory,
  cityFactory,
  segmentFactory,
} from "@/integrations/trav-com-integration/tests/factories"

describe("api/src/services/flight-statistics-jobs/aggregate-flight-statistic-service.ts", () => {
  describe("AggregateFlightStatisticService", () => {
    describe("#perform", () => {
      test("when invoice has appropriate data, creates a new flight statistic", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "C-19",
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 100.0,
            passengerName: "LEMKE/JOSUE MR",
            ticketNumber: "393939",
          })
        const _accountsReceivableInvoiceDetails2 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 7,
            sellingFare: 50.0,
            passengerName: "SCHULTZ/JOANNIE MRS",
            ticketNumber: "393940",
          })

        const departureCity = await cityFactory.create({
          cityCode: "YXY",
          cityName: "WHITEHORSE",
          state: "YT",
        })
        const arrivalCity = await cityFactory.create({
          cityCode: "YVR",
          cityName: "VANCOUVER INTL",
          state: "BC",
        })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: departureCity.cityCode,
          departureInfo: new Date("2025-01-01T10:00:00Z"),
          arrivalCityCode: arrivalCity.cityCode,
          arrivalInfo: new Date("2025-01-05T15:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
              include: [
                {
                  association: "arrivalCity",
                },
              ],
            },
          ],
        })

        // Act
        const flightStatistic =
          await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(flightStatistic).toMatchObject({
          departmentMailcode: "C-19",
          destinationAirportCode: "YVR",
          destinationCity: "VANCOUVER INTL",
          destinationProvince: "BC",
          totalExpenses: 150,
          totalFlightCost: 150,
          totalDays: 5,
          totalTrips: 1,
          totalRoundTrips: 0,
          totalRoundTripCost: 0,
          averageDurationDays: 5,
          averageExpensesPerDay: 30,
          averageRoundTripFlightCost: 0,
        })
      })

      test("when invoice has existing flight statistic, updates the totals", async () => {
        // Arrange
        const departmentMailcode = "W-17"
        const destinationAirportCode = "YVR"
        const destinationCity = "VANCOUVER INTL"
        const destinationProvince = "BC"

        await flightStatisticFactory.create({
          departmentMailcode,
          destinationAirportCode,
          destinationCity,
          destinationProvince,
          totalTrips: 1,
          totalRoundTrips: 0,
          totalDays: 3,
          totalExpenses: 100,
          totalFlightCost: 75,
          totalRoundTripCost: 0,
          averageDurationDays: 3,
          averageExpensesPerDay: 33.33,
          averageRoundTripFlightCost: 0,
        })

        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode,
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 50.0,
            passengerName: "TEST PASSENGER",
            ticketNumber: "123456",
          })

        const departureCity = await cityFactory.create({
          cityCode: "YXY",
          cityName: "WHITEHORSE",
          state: "YT",
        })
        const arrivalCity = await cityFactory.create({
          cityCode: destinationAirportCode,
          cityName: destinationCity,
          state: destinationProvince,
        })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: departureCity.cityCode,
          departureInfo: new Date("2025-02-01T10:00:00Z"),
          arrivalCityCode: arrivalCity.cityCode,
          arrivalInfo: new Date("2025-02-03T15:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
              include: [
                {
                  association: "arrivalCity",
                },
              ],
            },
          ],
        })

        // Act
        const result = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(result).toBeDefined()
        expect(result).toMatchObject({
          departmentMailcode,
          destinationAirportCode,
          destinationCity,
          destinationProvince,
          totalTrips: 2,
          totalDays: 6,
          totalExpenses: 150,
          totalFlightCost: 125,
          averageDurationDays: 3,
          averageExpensesPerDay: 25,
        })
      })

      test("when invoice is a round trip, calculates round trip statistics", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "K-6",
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 200.0,
            passengerName: "TEST PASSENGER",
            ticketNumber: "123456",
          })

        const whitehorse = await cityFactory.create({
          cityCode: "YXY",
          cityName: "WHITEHORSE",
          state: "YT",
        })
        const vancouver = await cityFactory.create({
          cityCode: "YVR",
          cityName: "VANCOUVER INTL",
          state: "BC",
        })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: whitehorse.cityCode,
          departureInfo: new Date("2025-01-01T10:00:00Z"),
          arrivalCityCode: vancouver.cityCode,
          arrivalInfo: new Date("2025-01-03T15:00:00Z"),
        })
        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 2,
          departureCityCode: vancouver.cityCode,
          departureInfo: new Date("2025-01-03T18:00:00Z"),
          arrivalCityCode: whitehorse.cityCode,
          arrivalInfo: new Date("2025-01-03T20:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
              include: [
                {
                  association: "arrivalCity",
                },
              ],
            },
          ],
        })

        // Act
        const result = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(result).toBeDefined()
        expect(result).toMatchObject({
          departmentMailcode: "K-6",
          totalRoundTrips: 1,
          totalRoundTripCost: 200,
          averageRoundTripFlightCost: 200,
        })
      })

      test("when invoice has no segments, returns null", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "J-11",
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
            },
          ],
        })

        // Act
        const result = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(result).toBeNull()
      })

      test("when invoice has missing department mailcode, returns null", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: null,
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 100.0,
            passengerName: "TEST PASSENGER",
            ticketNumber: "123456",
          })

        const departureCity = await cityFactory.create({
          cityCode: "YXY",
          cityName: "WHITEHORSE",
          state: "YT",
        })
        const arrivalCity = await cityFactory.create({
          cityCode: "YVR",
          cityName: "VANCOUVER INTL",
          state: "BC",
        })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: departureCity.cityCode,
          departureInfo: new Date("2025-01-01T10:00:00Z"),
          arrivalCityCode: arrivalCity.cityCode,
          arrivalInfo: new Date("2025-01-05T15:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
              include: [
                {
                  association: "arrivalCity",
                },
              ],
            },
          ],
        })

        // Act
        const result = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(result).toBeNull()
      })

      test("when invoice has missing city codes, returns null", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "CM-4",
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 100.0,
            passengerName: "TEST PASSENGER",
            ticketNumber: "123456",
          })

        await cityFactory.create({
          cityCode: "YVR",
          cityName: "VANCOUVER INTL",
          state: "BC",
        })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: null,
          departureInfo: new Date("2025-01-01T10:00:00Z"),
          arrivalCityCode: null,
          arrivalInfo: new Date("2025-01-05T15:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
              include: [
                {
                  association: "arrivalCity",
                },
              ],
            },
          ],
        })

        // Act
        const result = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(result).toBeNull()
      })

      test("when details association is not preloaded, errors informatively", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "A-9",
        })

        // Assert
        await expect(
          // Act
          AggregateFlightStatisticService.perform(accountsReceivableInvoice)
        ).rejects.toThrow("Expect details association to be preloaded")
      })

      test("when segments association is not preloaded, errors informatively", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "V-5",
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
          ],
        })

        // Assert
        await expect(
          // Act
          AggregateFlightStatisticService.perform(accountsReceivableInvoice)
        ).rejects.toThrow("Expect segments association to be preloaded")
      })

      test("when arrivalCity association is not preloaded, errors informatively", async () => {
        // Arrange
        const accountsReceivableInvoice = await accountsReceivableInvoiceFactory.create({
          departmentMailcode: "H-10",
        })

        const accountsReceivableInvoiceDetails1 =
          await accountsReceivableInvoiceDetailFactory.create({
            invoiceId: accountsReceivableInvoice.id,
            productCode: 4,
            sellingFare: 100.0,
            passengerName: "TEST PASSENGER",
            ticketNumber: "123456",
          })

        await segmentFactory.create({
          invoiceId: accountsReceivableInvoice.id,
          invoiceDetailId: accountsReceivableInvoiceDetails1.id,
          legNumber: 1,
          departureCityCode: "YXY",
          departureInfo: new Date("2025-01-01T10:00:00Z"),
          arrivalCityCode: "YVR",
          arrivalInfo: new Date("2025-01-05T15:00:00Z"),
        })

        await accountsReceivableInvoice.reload({
          include: [
            {
              association: "details",
            },
            {
              association: "segments",
            },
          ],
        })

        // Assert
        await expect(
          // Act
          AggregateFlightStatisticService.perform(accountsReceivableInvoice)
        ).rejects.toThrow("Expect arrivalCity association to be preloaded")
      })
    })
  })
})
