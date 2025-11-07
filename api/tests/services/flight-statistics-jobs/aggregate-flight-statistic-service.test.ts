import { TravComIntegration } from "@/integrations"
import { FlightStatistic } from "@/models"

import AggregateFlightStatisticService from "@/services/flight-statistics-jobs/aggregate-flight-statistic-service"

describe("api/src/services/flight-statistics-jobs/aggregate-flight-statistic-service.ts", () => {
  describe("AggregateFlightStatisticService", () => {
    describe("#perform", () => {
      test("when invoice has appropriate data, creates a new flight statistic", async () => {
        // Arrange
        const accountsReceivableInvoice =
          await TravComIntegration.Models.AccountsReceivableInvoice.create({
            id: 1,
            department: "TEST-DEPT",
            invoiceNumber: "00001",
          })

        const accountsReceivableInvoiceDetails =
          await TravComIntegration.Models.AccountsReceivableInvoiceDetail.bulkCreate([
            {
              id: 1,
              invoiceId: accountsReceivableInvoice.id,
              productCode: 4,
              sellingFare: 100.0,
              transactionType: 5,
              vendorNumber: "701",
              vendorName: "WESTJET AIRLINES",
              passengerName: "LEMKE/JOSUE MR",
              ticketNumber: "393939",
              publishedFare: 0,
              referenceFare: 0,
              lowFare: 0,
              tax1: 0,
              grossAmount: 0,
              commissionAmount: 0,
              vatOnCommission: 0,
              addedBy: 1,
            },
            {
              id: 2,
              invoiceId: accountsReceivableInvoice.id,
              productCode: 7,
              sellingFare: 50.0,
              transactionType: 5,
              vendorNumber: "701",
              vendorName: "WESTJET AIRLINES",
              passengerName: "SCHULTZ/JOANNIE MR",
              ticketNumber: "393940",
              publishedFare: 0,
              referenceFare: 0,
              lowFare: 0,
              tax1: 0,
              grossAmount: 0,
              commissionAmount: 0,
              vatOnCommission: 0,
              addedBy: 1,
            },
          ])

        const departureCity = await TravComIntegration.Models.City.create({
          cityType: 0,
          cityCode: "YXY",
          cityName: "WHITEHORSE",
          state: "YT",
          latitudeDegrees: 0,
          latitudeMinutes: 0,
          latitudeSeconds: 0,
          longitudeDegrees: 0,
          longitudeMinutes: 0,
          longitudeSeconds: 0,
        })
        const arrivalCity = await TravComIntegration.Models.City.create({
          cityType: 0,
          cityCode: "YVR",
          cityName: "VANCOUVER INTL",
          state: "BC",
          latitudeDegrees: 0,
          latitudeMinutes: 0,
          latitudeSeconds: 0,
          longitudeDegrees: 0,
          longitudeMinutes: 0,
          longitudeSeconds: 0,
        })
        await TravComIntegration.Models.Segment.bulkCreate([
          {
            id: 1,
            invoiceId: accountsReceivableInvoice.id,
            invoiceDetailId: accountsReceivableInvoiceDetails[0].id,
            legNumber: 1,
            departureCityCode: departureCity.cityCode,
            departureInfo: "2025-01-01T10:00:00Z",
            arrivalCityCode: arrivalCity.cityCode,
            arrivalInfo: "2025-01-05T15:00:00Z",
          },
        ])

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
        const flightStatistic = await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

        // Assert
        expect(flightStatistic).toMatchObject({
          department: "TEST-DEPT",
          destinationAirportCode: "YVR",
          destinationCity: "VANCOUVER INTL",
          destinationProvince: "BC",
          totalTrips: 1,
          totalDays: 5,
          totalExpenses: 150,
          totalFlightCost: 150,
        })
      })
    })
  })
})
