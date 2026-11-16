import Papa from "papaparse"
import qs from "qs"

import { User } from "@/models"

import { flightReconciliationFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

const CSV_HEADERS = [
  "Purchase Date",
  "Cost",
  "Agent",
  "Airline",
  "Flight Info",
  "Final Destination",
  "Department Mailcode",
  "Traveler First Name",
  "Traveler Last Name",
  "Reconciled",
  "Reconcile Period",
]

describe("api/src/controllers/downloads/flight-reconciliations-controller.ts", () => {
  describe("FlightReconciliationsController", () => {
    describe("#create", () => {
      test("when finance selects mixed mailcodes, it exports only authorized IDs in requested order with report formatting", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.FINANCE_USER],
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
        const query = qs.stringify({
          format: "csv",
          where: { id: [reconciliation1.id, hiddenReconciliation.id, reconciliation2.id] },
          order: [["id", "DESC"]],
        })

        // Act
        const response = await request().post("/api/downloads/flight-reconciliations").query(query)
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
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const reconciliations = await flightReconciliationFactory.createList(25)
        const selectedIds = reconciliations.map(({ id }) => id)
        await flightReconciliationFactory.create({ invoiceDetailComputedTravelerLastName: "Excluded" })
        const query = qs.stringify({
          format: "csv",
          where: { id: selectedIds },
          order: [["id", "DESC"]],
          perPage: 1,
          page: 2,
        })

        // Act
        const response = await request().post("/api/downloads/flight-reconciliations").query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data.map((row) => row["Traveler Last Name"])).toEqual(
          [...reconciliations].reverse().map((record) => record.invoiceDetailComputedTravelerLastName)
        )
      })

      test("when only another mailcode is selected, it returns headers without disclosing data", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.FINANCE_USER], mailcode: "F-1" })
        mockCurrentUser(user1)
        const hiddenReconciliation = await flightReconciliationFactory.create({
          invoiceDepartmentMailcode: "OTHER",
        })
        const query = qs.stringify({
          format: "csv",
          where: {
            id: [hiddenReconciliation.id],
            invoiceDepartmentMailcode: "OTHER",
          },
        })

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${CSV_HEADERS.join(",")}\r\n`))
      })

      test("when an ordinary user requests all records, it returns headers without disclosing data", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        await flightReconciliationFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv" })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${CSV_HEADERS.join(",")}\r\n`))
      })

      test("when the query matches nothing, it sends a BOM and CRLF headers-only file", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        await flightReconciliationFactory.create()

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "csv", where: { id: -1 } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from(`\uFEFF${CSV_HEADERS.join(",")}\r\n`))
      })

      test("when CSV is requested, it sets the familiar filename and CSV media type", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
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
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/flight-reconciliations")
          .query({ format: "pdf" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message: "Unsupported report format" })
      })
    })
  })
})
