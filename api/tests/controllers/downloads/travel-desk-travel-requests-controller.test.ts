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
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Jane",
          lastName: "Traveller",
          department: "Finance",
          branch: "Travel",
        })
        mockCurrentUser(user1)
        const selectedIds: number[] = []
        for (let requestIndex = 0; requestIndex < SELECTED_REQUEST_COUNT; requestIndex += 1) {
          const travelAuthorization = await travelAuthorizationFactory
            .associations({ user: user1 })
            .create()
          const travelDeskOfficer = `Officer ${String(requestIndex + 1).padStart(2, "0")}`
          const travelDeskTravelRequest = await travelDeskTravelRequestFactory
            .associations({ travelAuthorization })
            .create({
              createdAt: new Date("2026-10-01T12:00:00.000Z"),
              status: TravelDeskTravelRequest.Statuses.DRAFT,
              travelDeskOfficer,
            })
          selectedIds.push(travelDeskTravelRequest.id)
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
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        const expectedRowFields = {
          "Submit Date": "2026-10-01",
          Name: "Jane Traveller",
          Department: "Finance",
          Branch: "Travel",
          "Travel Start Date": "",
          "Travel End Date": "",
          Location: "",
          Requested: "",
          Status: "Draft",
        }
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          { ...expectedRowFields, "Travel Desk Officer": "Officer 25" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 24" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 23" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 22" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 21" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 20" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 19" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 18" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 17" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 16" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 15" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 14" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 13" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 12" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 11" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 10" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 09" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 08" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 07" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 06" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 05" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 04" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 03" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 02" },
          { ...expectedRowFields, "Travel Desk Officer": "Officer 01" },
        ])
      })

      test("when a native form uses a status query, it downloads matching requests without an ID payload", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Jane",
          lastName: "Traveller",
          department: "Finance",
          branch: "Travel",
        })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
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
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            "Submit Date": "2026-10-01",
            Name: "Jane Traveller",
            Department: "Finance",
            Branch: "Travel",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Draft",
            "Travel Desk Officer": "Draft Officer",
          },
        ])
      })

      test("when an ID query includes another user's request, it exports only policy-visible rows", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Jane",
          lastName: "Traveller",
          department: "Finance",
          branch: "Travel",
        })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const ownRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: "Visible Officer",
          })
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
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            "Submit Date": "2026-10-01",
            Name: "Jane Traveller",
            Department: "Finance",
            Branch: "Travel",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Draft",
            "Travel Desk Officer": "Visible Officer",
          },
        ])
      })

      test("when the query matches no requests, it returns an unprocessable response without download headers", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query({ format: "csv", where: { id: [NONEXISTENT_REQUEST_ID] } })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel desk travel requests download",
        })
        expect(response.headers["content-disposition"]).toBeUndefined()
      })

      test("when a PDF query matches only an inaccessible request, it returns an unprocessable response without download headers", async () => {
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
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel desk travel requests download",
        })
        expect(response.headers["content-disposition"]).toBeUndefined()
      })

      test("when where, filter scopes, and order are combined, it exports the matching rows in scope-defined order", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Jane",
          lastName: "Traveller",
          department: "Finance",
          branch: "Travel",
        })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const draftRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: "Draft Officer",
          })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const bookedRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
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
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual([
          {
            "Submit Date": "2026-10-01",
            Name: "Jane Traveller",
            Department: "Finance",
            Branch: "Travel",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Booked",
            "Travel Desk Officer": "Booked Officer",
          },
          {
            "Submit Date": "2026-10-01",
            Name: "Jane Traveller",
            Department: "Finance",
            Branch: "Travel",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Draft",
            "Travel Desk Officer": "Draft Officer",
          },
        ])
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
