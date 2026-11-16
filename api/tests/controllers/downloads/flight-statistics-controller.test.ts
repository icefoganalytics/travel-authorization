import Papa from "papaparse"
import qs from "qs"

import { User } from "@/models"

import { flightStatisticFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

const CSV_HEADERS = [
  "Department Mailcode",
  "Final Destination City",
  "Final Destination Province",
  "Total Trips",
  "Total Expenses",
  "Total Flight Cost",
  "Average Duration (days)",
  "Average Expenses per Day",
  "Average Round Trip Flight Cost",
]

describe("api/src/controllers/downloads/flight-statistics-controller.ts", () => {
  describe("FlightStatisticsController", () => {
    describe("#create", () => {
      test("when admin combines filters and where, it exports matching rows in department and destination order", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const reportFactory = flightStatisticFactory.params({
          destinationProvince: "YT",
          totalTrips: 0,
          totalExpenses: 1234.5,
          totalFlightCost: 1,
          averageDurationDays: -2.5,
          averageExpensesPerDay: 0,
          averageRoundTripFlightCost: 0.125,
        })
        await reportFactory.create({ departmentMailcode: "B-1", destinationCity: "Whitehorse" })
        await reportFactory.create({ departmentMailcode: "A-1", destinationCity: "Whitehorse" })
        await reportFactory.create({ departmentMailcode: "A-1", destinationCity: "=SUM(1,2)" })
        await reportFactory.create({ departmentMailcode: "OTHER", destinationCity: "Whitehorse" })
        await reportFactory.create({
          departmentMailcode: "A-1",
          destinationCity: "Vancouver",
          destinationProvince: "BC",
        })
        const query = qs.stringify({
          format: "csv",
          where: { destinationProvince: "YT" },
          filters: { byDepartmentMailcodes: ["A-1", "B-1"] },
        })

        // Act
        const response = await request().post("/api/downloads/flight-statistics").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        const expectedValues = {
          "Final Destination Province": "YT",
          "Total Trips": "0",
          "Total Expenses": "$1,234.50",
          "Total Flight Cost": "$1.000",
          "Average Duration (days)": "-2.5",
          "Average Expenses per Day": "$0.000",
          "Average Round Trip Flight Cost": "$0.125",
        }
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            ...expectedValues,
            "Department Mailcode": "A-1",
            "Final Destination City": "'=SUM(1,2)",
          },
          {
            ...expectedValues,
            "Department Mailcode": "A-1",
            "Final Destination City": "Whitehorse",
          },
          {
            ...expectedValues,
            "Department Mailcode": "B-1",
            "Final Destination City": "Whitehorse",
          },
        ])
      })

      test("when more than one thousand records match, it ignores list pagination and exports every row in requested order", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const statistics = await flightStatisticFactory.createList(1001)
        const query = qs.stringify({
          format: "csv",
          order: [["id", "DESC"]],
          page: 2,
          perPage: 1,
        })

        // Act
        const response = await request().post("/api/downloads/flight-statistics").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data.map((row) => row["Final Destination City"])).toEqual(
          [...statistics].reverse().map((record) => record.destinationCity)
        )
      })

      test("when a non-admin supplies visible IDs and filter scopes, it exports no private data", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.FINANCE_USER] })
        mockCurrentUser(user1)
        const statistic = await flightStatisticFactory.create({ departmentMailcode: "F-1" })
        const query = qs.stringify({
          format: "csv",
          where: { id: [statistic.id] },
          filters: { byDepartmentMailcodes: ["F-1"] },
        })

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${CSV_HEADERS.join(",")}\r\n`))
      })

      test("when an admin query matches nothing, it returns BOM and CRLF headers only", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        await flightStatisticFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv", where: { id: -1 } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${CSV_HEADERS.join(",")}\r\n`))
      })

      test("when CSV is requested, it sets the familiar timestamped filename and media type", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv" })

        // Assert
        expect(response.headers).toEqual(
          expect.objectContaining({
            "content-disposition": expect.stringMatching(
              /^attachment; filename="Export, Flight Statistics, \d{4}-\d{2}-\d{2}_\d{4}\.csv"$/
            ),
            "content-type": "text/csv; charset=utf-8",
          })
        )
      })

      test("when format is unsupported, it rejects the request", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "pdf" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message: "Unsupported report format" })
      })
    })
  })
})
