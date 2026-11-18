import { EventEmitter, once } from "node:events"
import { type IncomingMessage } from "node:http"
import { createInterface } from "node:readline"

import Papa from "papaparse"
import { type Response } from "supertest"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { FLIGHT_STATISTIC_REPORT_HEADERS } from "@/serializers/flight-statistics/report-serializer"
import { CreateCsvService } from "@/services/downloads/flight-statistics/create-csv-service"

import { flightStatisticFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/downloads/flight-statistics-controller.ts", () => {
  describe("FlightStatisticsController", () => {
    describe("#create - POST - /api/downloads/flight-statistics", () => {
      test("when admin combines filters and where, it exports matching rows in department and destination order", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
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
        const query = {
          format: "csv",
          where: { destinationProvince: "YT" },
          filters: { byDepartmentMailcodes: ["A-1", "B-1"] },
        }

        // Act
        const response = await request().post("/api/downloads/flight-statistics").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            "Final Destination Province": "YT",
            "Total Trips": "0",
            "Total Expenses": "$1,234.50",
            "Total Flight Cost": "$1.000",
            "Average Duration (days)": "-2.5",
            "Average Expenses per Day": "$0.000",
            "Average Round Trip Flight Cost": "$0.125",
            "Department Mailcode": "A-1",
            "Final Destination City": "'=SUM(1,2)",
          },
          {
            "Final Destination Province": "YT",
            "Total Trips": "0",
            "Total Expenses": "$1,234.50",
            "Total Flight Cost": "$1.000",
            "Average Duration (days)": "-2.5",
            "Average Expenses per Day": "$0.000",
            "Average Round Trip Flight Cost": "$0.125",
            "Department Mailcode": "A-1",
            "Final Destination City": "Whitehorse",
          },
          {
            "Final Destination Province": "YT",
            "Total Trips": "0",
            "Total Expenses": "$1,234.50",
            "Total Flight Cost": "$1.000",
            "Average Duration (days)": "-2.5",
            "Average Expenses per Day": "$0.000",
            "Average Round Trip Flight Cost": "$0.125",
            "Department Mailcode": "B-1",
            "Final Destination City": "Whitehorse",
          },
        ])
      })

      test("when more than one thousand records match, it ignores list pagination and exports every row in requested order", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        await flightStatisticFactory.create({ destinationCity: "First city" })
        await flightStatisticFactory.createList(999, { destinationCity: "Middle city" })
        await flightStatisticFactory.create({ destinationCity: "Last city" })
        const query = {
          format: "csv",
          order: [["id", "DESC"]],
          page: 2,
          perPage: 1,
        }

        // Act
        const response = await request().post("/api/downloads/flight-statistics").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data.map((row) => row["Final Destination City"])).toEqual([
          "Last city",
          ...Array(999).fill("Middle city"),
          "First city",
        ])
      })

      test("when a non-admin supplies visible IDs and filter scopes, it exports no private data", async () => {
        // Arrange
        const user1 = await userFactory.asFinanceUser().create()
        mockCurrentUser(user1)
        const statistic = await flightStatisticFactory.create({ departmentMailcode: "F-1" })
        const query = {
          format: "csv",
          where: { id: [statistic.id] },
          filters: { byDepartmentMailcodes: ["F-1"] },
        }

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${FLIGHT_STATISTIC_REPORT_HEADERS.join(",")}\r\n`))
      })

      test("when an admin query matches nothing, it returns BOM and CRLF headers only", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        await flightStatisticFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv", where: { id: -1 } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${FLIGHT_STATISTIC_REPORT_HEADERS.join(",")}\r\n`))
      })

      test("when CSV is requested, it sets the familiar timestamped filename and media type", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
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
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "pdf" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message: "Unsupported report format" })
      })

      test("when later rows are pending, it delivers an earlier row before generation finishes", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(CreateCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [outputStream] = args as ConstructorParameters<typeof CreateCsvService>
            await csvStreamingClient.stream(outputStream, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Next traveller" })
              await completion
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        const download = request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv" })
          .buffer(false)
          .timeout(4000)
          .on("response", (response: Response & { res: IncomingMessage }) => {
            response.res.pause()
          })
        const responseReceived = once(download, "response")
        const downloadFinished = Promise.allSettled([download])

        try {
          // Act
          const [response] = (await responseReceived) as [Response & { res: IncomingMessage }]
          const lines = createInterface({ input: response.res })
          const reader = lines[Symbol.asyncIterator]()
          await reader.next() // Column header.
          const firstRow = await reader.next()

          // Assert
          expect(response.status).toEqual(200)
          expect(firstRow.value).toEqual("Traveller")
        } finally {
          generation.emit("complete")
          await downloadFinished
        }
      })

      test("when generation completes, it delivers the complete CSV", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        vi.spyOn(CreateCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [outputStream] = args as ConstructorParameters<typeof CreateCsvService>
            await csvStreamingClient.stream(outputStream, ["Name"], async (writeRow) => {
              await writeRow({ Name: "Traveller" })
              await writeRow({ Name: "Last traveller" })
            })
          }
        )

        // Act
        const response = await request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv" })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from("\uFEFFName\r\nTraveller\r\nLast traveller\r\n"))
      })

      test("when generation fails after headers arrive, it rejects the partial download", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        const generation = new EventEmitter()
        const completion = once(generation, "complete")
        vi.spyOn(CreateCsvService, "perform").mockImplementation(
          async (...args: unknown[]) => {
            const [outputStream] = args as ConstructorParameters<typeof CreateCsvService>
            outputStream.write("\uFEFFName\r\n")
            await completion
          }
        )

        const download = request()
          .post("/api/downloads/flight-statistics")
          .query({ format: "csv" })
          .buffer(false)
          .timeout(4000)
        const responseReceived = once(download, "response")
        const downloadFinished = Promise.allSettled([download])

        try {
          // Act
          const [response] = (await responseReceived) as [Response]
          const responseEnded = once(response, "end")
          generation.emit("error", new Error("CSV generation failed"))

          // Assert
          await expect(responseEnded).rejects.toMatchObject({ code: "ECONNRESET" })
        } finally {
          generation.emit("complete")
          await downloadFinished
        }
      })
    })
  })
})
