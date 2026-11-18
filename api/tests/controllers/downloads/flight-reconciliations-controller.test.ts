import { EventEmitter, once } from "node:events"

import Papa from "papaparse"
import { type Response } from "supertest"

import { FLIGHT_RECONCILIATION_REPORT_HEADERS } from "@/serializers/flight-reconciliations/report-serializer"
import { CreateCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"

import { flightReconciliationFactory, userFactory } from "@/factories"
import { mockCurrentUser, readResponseLines, request } from "@/support"

describe("api/src/controllers/downloads/flight-reconciliations-controller.ts", () => {
  describe("FlightReconciliationsController", () => {
    describe("#create - POST - /api/downloads/flight-reconciliations", () => {
      test("when finance selects mixed mailcodes, it exports only authorized IDs in requested order with report formatting", async () => {
        // Arrange
        const user1 = await userFactory.asFinanceUser().create({
          mailcode: "F-1",
        })
        mockCurrentUser(user1)
        const reconciliation1 = await flightReconciliationFactory.create({
          invoiceDepartmentMailcode: "F-1",
          invoiceDetailComputedTravelerFirstName: "=SUM(1,2)",
          invoiceDetailComputedTravelerLastName: "Traveller",
          reconciled: true,
          reconcilePeriod: 4,
        })
        const reconciliation2 = await flightReconciliationFactory.create({
          invoiceDepartmentMailcode: "F-1",
          invoiceBookingDate: null,
          invoiceDetailSellingFare: 0,
          invoiceDetailComputedAgentName: null,
          invoiceDetailComputedTravelerFirstName: "Jane",
          invoiceDetailComputedTravelerLastName: "Traveller",
          segmentsComputedFlightInfo: null,
          segmentsComputedFinalDestination: null,
        })
        const hiddenReconciliation = await flightReconciliationFactory.create({
          invoiceDepartmentMailcode: "OTHER",
        })
        await flightReconciliationFactory.create({ invoiceDepartmentMailcode: "F-1" })

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({
            format: "csv",
            where: { id: [reconciliation1.id, hiddenReconciliation.id, reconciliation2.id] },
            order: [["id", "DESC"]],
          })
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            "Purchase Date": "",
            Cost: "$0.000",
            Agent: "",
            Airline: "Air North",
            "Flight Info": "",
            "Final Destination": "",
            "Department Mailcode": "F-1",
            "Traveler First Name": "Jane",
            "Traveler Last Name": "Traveller",
            Reconciled: "No",
            "Reconcile Period": "",
          },
          {
            "Purchase Date": "Oct 1 2026",
            Cost: "$1,234.50",
            Agent: "Jane Agent",
            Airline: "Air North",
            "Flight Info": "YXY-YVR\r\nYVR-YYZ",
            "Final Destination": "Toronto",
            "Department Mailcode": "F-1",
            "Traveler First Name": "'=SUM(1,2)",
            "Traveler Last Name": "Traveller",
            Reconciled: "Yes",
            "Reconcile Period": "4",
          },
        ])
      })

      test("when selection exceeds a list page and query parser threshold, it exports every selected row", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        const reconciliations = await flightReconciliationFactory.createMany([
          { invoiceDetailComputedTravelerLastName: "Traveller 1" },
          { invoiceDetailComputedTravelerLastName: "Traveller 2" },
          { invoiceDetailComputedTravelerLastName: "Traveller 3" },
          { invoiceDetailComputedTravelerLastName: "Traveller 4" },
          { invoiceDetailComputedTravelerLastName: "Traveller 5" },
          { invoiceDetailComputedTravelerLastName: "Traveller 6" },
          { invoiceDetailComputedTravelerLastName: "Traveller 7" },
          { invoiceDetailComputedTravelerLastName: "Traveller 8" },
          { invoiceDetailComputedTravelerLastName: "Traveller 9" },
          { invoiceDetailComputedTravelerLastName: "Traveller 10" },
          { invoiceDetailComputedTravelerLastName: "Traveller 11" },
          { invoiceDetailComputedTravelerLastName: "Traveller 12" },
          { invoiceDetailComputedTravelerLastName: "Traveller 13" },
          { invoiceDetailComputedTravelerLastName: "Traveller 14" },
          { invoiceDetailComputedTravelerLastName: "Traveller 15" },
          { invoiceDetailComputedTravelerLastName: "Traveller 16" },
          { invoiceDetailComputedTravelerLastName: "Traveller 17" },
          { invoiceDetailComputedTravelerLastName: "Traveller 18" },
          { invoiceDetailComputedTravelerLastName: "Traveller 19" },
          { invoiceDetailComputedTravelerLastName: "Traveller 20" },
          { invoiceDetailComputedTravelerLastName: "Traveller 21" },
          { invoiceDetailComputedTravelerLastName: "Traveller 22" },
          { invoiceDetailComputedTravelerLastName: "Traveller 23" },
          { invoiceDetailComputedTravelerLastName: "Traveller 24" },
          { invoiceDetailComputedTravelerLastName: "Traveller 25" },
        ])
        const selectedIds = reconciliations.map(({ id }) => id)
        await flightReconciliationFactory.create({ invoiceDetailComputedTravelerLastName: "Excluded" })
        const query = {
          format: "csv",
          where: { id: selectedIds },
          order: [["id", "DESC"]],
          perPage: 1,
          page: 2,
        }

        // Act
        const response = await request().post("/api/downloads/flight-reconciliations").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        const travelerLastNames = parsedCsv.data.map((row) => row["Traveler Last Name"])

        // Assert
        expect(response.status).toEqual(200)
        expect(travelerLastNames).toEqual([
          "Traveller 25",
          "Traveller 24",
          "Traveller 23",
          "Traveller 22",
          "Traveller 21",
          "Traveller 20",
          "Traveller 19",
          "Traveller 18",
          "Traveller 17",
          "Traveller 16",
          "Traveller 15",
          "Traveller 14",
          "Traveller 13",
          "Traveller 12",
          "Traveller 11",
          "Traveller 10",
          "Traveller 9",
          "Traveller 8",
          "Traveller 7",
          "Traveller 6",
          "Traveller 5",
          "Traveller 4",
          "Traveller 3",
          "Traveller 2",
          "Traveller 1",
        ])
      })

      test("when only another mailcode is selected, it returns headers without disclosing data", async () => {
        // Arrange
        const user1 = await userFactory.asFinanceUser().create({ mailcode: "F-1" })
        mockCurrentUser(user1)
        const hiddenReconciliation = await flightReconciliationFactory.create({
          invoiceDepartmentMailcode: "OTHER",
        })
        const query = {
          format: "csv",
          where: {
            id: [hiddenReconciliation.id],
            invoiceDepartmentMailcode: "OTHER",
          },
        }

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${FLIGHT_RECONCILIATION_REPORT_HEADERS.join(",")}\r\n`))
      })

      test("when an ordinary user requests all records, it returns headers without disclosing data", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create()
        mockCurrentUser(user1)
        await flightReconciliationFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv" })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${FLIGHT_RECONCILIATION_REPORT_HEADERS.join(",")}\r\n`))
      })

      test("when the query matches nothing, it sends a BOM and CRLF headers-only file", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)
        await flightReconciliationFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv", where: { id: -1 } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${FLIGHT_RECONCILIATION_REPORT_HEADERS.join(",")}\r\n`))
      })

      test("when CSV is requested, it sets the familiar filename and CSV media type", async () => {
        // Arrange
        const user1 = await userFactory.asAdmin().create()
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv" })

        // Assert
        expect(response.headers).toEqual(
          expect.objectContaining({
            "content-disposition": expect.stringMatching(
              /^attachment; filename="Export, Flight Reconciliations, \d{4}-\d{2}-\d{2}\.csv"$/
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
          .post("/api/downloads/flight-reconciliations")
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
            outputStream.write("\uFEFFName\r\nTraveller\r\n")
            await completion
            outputStream.end("Last traveller\r\n")
          }
        )

        const download = request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv" })
          .buffer(false)
          .timeout(4000)
        const earlyResponse = readResponseLines(download, { lineCount: 2 })
        const downloadFinished = Promise.allSettled([download])

        try {
          // Act
          const response = await earlyResponse

          // Assert
          expect(response.status).toEqual(200)
          expect(response.lines).toEqual(["\uFEFFName", "Traveller"])
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
            outputStream.end("\uFEFFName\r\nTraveller\r\nLast traveller\r\n")
          }
        )

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
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
          .post("/api/downloads/flight-reconciliations")
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
