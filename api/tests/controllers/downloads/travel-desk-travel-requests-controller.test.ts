import Papa from "papaparse"
import qs from "qs"

import { TravelDeskTravelRequest, User } from "@/models"
import { CreatePdfService } from "@/services/downloads/travel-desk-travel-requests/create-pdf-service"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import { mockCurrentUser, request } from "@/support"

const SELECTED_REQUEST_COUNT = 25
const NONEXISTENT_REQUEST_ID = 999999999

describe("api/src/controllers/downloads/travel-desk-travel-requests-controller.ts", () => {
  describe("TravelDeskTravelRequestsController", () => {
    describe("#create", () => {
      test("when an indexed ID query exceeds twenty values, it exports every matching row in the requested order", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const selectedIds: number[] = []
        const expectedOfficerNames: string[] = []
        for (let requestIndex = 0; requestIndex < SELECTED_REQUEST_COUNT; requestIndex += 1) {
          const travelAuthorization = await travelAuthorizationFactory
            .associations({ user: user1 })
            .create()
          const travelDeskOfficer = `Officer ${String(requestIndex + 1).padStart(2, "0")}`
          const travelDeskTravelRequest = await travelDeskTravelRequestFactory
            .associations({ travelAuthorization })
            .create({ travelDeskOfficer })
          selectedIds.push(travelDeskTravelRequest.id)
          expectedOfficerNames.push(travelDeskOfficer)
        }
        const unselectedTravelAuthorization = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: unselectedTravelAuthorization })
          .create({ travelDeskOfficer: "Unselected Officer" })
        const query = qs.stringify({
          format: "csv",
          where: { id: selectedIds },
          order: [["id", "DESC"]],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query(query)

        // Assert
        expect(response.status).toEqual(200)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        const officerNames = parsedCsv.data.map((row) => row["Travel Desk Officer"])
        expect(officerNames).toEqual(expectedOfficerNames.reverse())
      })

      test("when a native form uses a status query, it downloads matching requests without an ID payload", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: "Draft Officer",
          })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({
            status: TravelDeskTravelRequest.Statuses.BOOKED,
            travelDeskOfficer: "Booked Officer",
          })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "csv", where: { status: TravelDeskTravelRequest.Statuses.DRAFT } })
          .type("form")
          .send({})

        // Assert
        expect(response.status).toEqual(200)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        const officerNames = parsedCsv.data.map((row) => row["Travel Desk Officer"])
        expect(officerNames).toEqual(["Draft Officer"])
      })

      test("when an ID query includes another user's request, it exports only policy-visible rows", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const ownRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ travelDeskOfficer: "Visible Officer" })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        const foreignRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({ travelDeskOfficer: "Hidden Officer" })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "csv", where: { id: [ownRequest.id, foreignRequest.id] } })

        // Assert
        expect(response.status).toEqual(200)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        const officerNames = parsedCsv.data.map((row) => row["Travel Desk Officer"])
        expect(officerNames).toEqual(["Visible Officer"])
      })

      test("when the query matches no requests, it returns a generic not-found response", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "csv", where: { id: [NONEXISTENT_REQUEST_ID] } })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel requests were not found",
        })
      })

      test("when a PDF query matches only an inaccessible request, it returns not found", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        const foreignRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "pdf", where: { id: [foreignRequest.id] } })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel requests were not found",
        })
      })

      test("when where, filter scopes, and order are combined, it exports the matching rows in scope-defined order", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const draftRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: "Draft Officer",
          })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const bookedRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({
            status: TravelDeskTravelRequest.Statuses.BOOKED,
            travelDeskOfficer: "Booked Officer",
          })
        const query = qs.stringify({
          format: "csv",
          where: { id: [draftRequest.id, bookedRequest.id] },
          filters: { includeIsBookedAttribute: true },
          order: [["isBooked", "DESC"]],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query(query)

        // Assert
        expect(response.status).toEqual(200)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        const officerNames = parsedCsv.data.map((row) => row["Travel Desk Officer"])
        expect(officerNames).toEqual(["Booked Officer", "Draft Officer"])
      })

      test("when PDF generation fails, it returns an unprocessable response without download headers", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        vi.spyOn(CreatePdfService, "perform").mockRejectedValueOnce(
          new Error("PDF rendering failed")
        )

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "pdf", where: { id: [travelDeskTravelRequest.id] } })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel desk travel requests download",
        })
        expect(response.headers["content-disposition"]).toBeUndefined()
      })

      test("when a query cannot be processed, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "csv", where: { id: "not-a-number" } })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel desk travel requests download",
        })
      })

      test("when a format is not supported, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "json" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Unsupported report format",
        })
      })
    })
  })
})
