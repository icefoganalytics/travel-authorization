import { EventEmitter, once } from "node:events"
import { type IncomingMessage } from "node:http"
import { createInterface } from "node:readline"

import Papa from "papaparse"
import qs from "qs"
import { type Response } from "supertest"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { TravelAuthorizationPreApproval } from "@/models"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS } from "@/serializers/travel-authorization-pre-approvals/report-serializer"
import { CreateCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/downloads/travel-authorization-pre-approvals-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("#create - POST - /api/downloads/travel-authorization-pre-approvals", () => {
      test("when records and profiles are visible, it exports their complete display values", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          branch: "Travel",
          estimatedCost: 1234,
          location: "Dawson",
          purpose: "Training",
          reason: "Annual meeting",
          travelerNotes: "Bring documents",
          status: TravelAuthorizationPreApproval.Statuses.APPROVED,
          isOpenForAnyDate: false,
          startDate: new Date("2026-11-20T00:00:00.000Z"),
          endDate: new Date("2026-11-22T00:00:00.000Z"),
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Finance",
          profileName: "Jane.Traveller",
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Finance",
          profileName: "Alex.Second.Name",
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Health",
          profileName: "Hidden.Profile",
        })
        await travelAuthorizationPreApprovalFactory.create({ department: "Health" })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv" })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(
          Buffer.from(
            "\uFEFF" +
              (TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS.join(",") + "\r\n") +
              '"Jane Traveller, Alex Second.Name",Finance,Travel,2026-11-20T00:00:00.000Z to 2026-11-22T00:00:00.000Z,Dawson,Training,"$1,234.00",Annual meeting,approved,Bring documents\r\n'
          )
        )
      })

      test("when downloading CSV, it retains the familiar filename and CSV metadata", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv" })

        // Assert
        expect(response.headers).toEqual(
          expect.objectContaining({
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": expect.stringMatching(
              /^attachment; filename="Export, Travel Pre-Approval Requests, \d{4}-\d{2}-\d{2}_\d{4}\.csv"$/
            ),
          })
        )
      })

      test("when a hostile where query selects another department, it exports headers only", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })
        const hiddenPreApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })
        const query = qs.stringify({
          format: "csv",
          where: { id: hiddenPreApproval.id, department: "Health" },
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from("\uFEFF" + (TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS.join(",") + "\r\n")))
      })

      test("when the query has no matches, it exports headers only", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", where: { location: "No matching destination" } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from("\uFEFF" + (TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS.join(",") + "\r\n")))
      })

      test("when matches span database batches, it exports every authorized pre-approval without list pagination", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.createList(1001, {
          department: "Finance",
          branch: null,
          isOpenForAnyDate: true,
          month: "November",
          location: "Dawson",
          purpose: null,
          estimatedCost: 0,
          reason: null,
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          travelerNotes: null,
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", perPage: 1, page: 2 })
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual(
          Array.from({ length: 1001 }, () => ({
            Name: "",
            Department: "Finance",
            Branch: "",
            "Travel Date": "November",
            Location: "Dawson",
            Purpose: "",
            "Estimated Cost": "$0.000",
            Reason: "",
            Status: "draft",
            Notes: "",
          }))
        )
      }, 15_000)

      test("when filters, where, and order are combined, they narrow and sort visible matches", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)
        const preApproval1 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          submissionId: null,
          location: "Dawson",
        })
        const preApproval2 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          submissionId: null,
          location: "Whitehorse",
        })
        const preApproval3 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.APPROVED,
          location: "Excluded",
        })
        await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          location: "Not selected",
        })
        const query = qs.stringify({
          format: "csv",
          where: { id: [preApproval1.id, preApproval2.id, preApproval3.id] },
          filters: { availableForSubmission: true },
          order: [["location", "DESC"]],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data.map((row) => row.Location)).toEqual(["Whitehorse", "Dawson"])
      })

      test("when a format is unsupported, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create()
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "pdf" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message: "Unsupported report format" })
      })

      test("when a query fails after the download starts, it aborts the transfer", async () => {
        // Arrange
        const user1 = await userFactory.asUser().create({ department: "Finance" })
        mockCurrentUser(user1)

        // Act / Assert
        await expect(
          request()
            .post("/api/downloads/travel-authorization-pre-approvals")
            .query({ format: "csv", where: { id: "invalid" } })
        ).rejects.toMatchObject({ code: "ECONNRESET" })
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
          .post("/api/downloads/travel-authorization-pre-approvals")
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
          .post("/api/downloads/travel-authorization-pre-approvals")
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
          .post("/api/downloads/travel-authorization-pre-approvals")
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
