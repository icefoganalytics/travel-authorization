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
        const travelAuthorizations = await travelAuthorizationFactory
          .associations({ user: user1 })
          .createList(SELECTED_REQUEST_COUNT)
        const draftTravelDeskTravelRequestFactory = travelDeskTravelRequestFactory.params({
          createdAt: new Date("2026-10-01T12:00:00.000Z"),
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })
        const travelDeskTravelRequest1 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[0] })
          .create({
            travelDeskOfficer: "Officer 01",
          })
        const travelDeskTravelRequest2 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[1] })
          .create({
            travelDeskOfficer: "Officer 02",
          })
        const travelDeskTravelRequest3 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[2] })
          .create({
            travelDeskOfficer: "Officer 03",
          })
        const travelDeskTravelRequest4 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[3] })
          .create({
            travelDeskOfficer: "Officer 04",
          })
        const travelDeskTravelRequest5 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[4] })
          .create({
            travelDeskOfficer: "Officer 05",
          })
        const travelDeskTravelRequest6 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[5] })
          .create({
            travelDeskOfficer: "Officer 06",
          })
        const travelDeskTravelRequest7 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[6] })
          .create({
            travelDeskOfficer: "Officer 07",
          })
        const travelDeskTravelRequest8 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[7] })
          .create({
            travelDeskOfficer: "Officer 08",
          })
        const travelDeskTravelRequest9 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[8] })
          .create({
            travelDeskOfficer: "Officer 09",
          })
        const travelDeskTravelRequest10 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[9] })
          .create({
            travelDeskOfficer: "Officer 10",
          })
        const travelDeskTravelRequest11 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[10] })
          .create({
            travelDeskOfficer: "Officer 11",
          })
        const travelDeskTravelRequest12 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[11] })
          .create({
            travelDeskOfficer: "Officer 12",
          })
        const travelDeskTravelRequest13 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[12] })
          .create({
            travelDeskOfficer: "Officer 13",
          })
        const travelDeskTravelRequest14 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[13] })
          .create({
            travelDeskOfficer: "Officer 14",
          })
        const travelDeskTravelRequest15 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[14] })
          .create({
            travelDeskOfficer: "Officer 15",
          })
        const travelDeskTravelRequest16 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[15] })
          .create({
            travelDeskOfficer: "Officer 16",
          })
        const travelDeskTravelRequest17 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[16] })
          .create({
            travelDeskOfficer: "Officer 17",
          })
        const travelDeskTravelRequest18 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[17] })
          .create({
            travelDeskOfficer: "Officer 18",
          })
        const travelDeskTravelRequest19 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[18] })
          .create({
            travelDeskOfficer: "Officer 19",
          })
        const travelDeskTravelRequest20 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[19] })
          .create({
            travelDeskOfficer: "Officer 20",
          })
        const travelDeskTravelRequest21 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[20] })
          .create({
            travelDeskOfficer: "Officer 21",
          })
        const travelDeskTravelRequest22 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[21] })
          .create({
            travelDeskOfficer: "Officer 22",
          })
        const travelDeskTravelRequest23 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[22] })
          .create({
            travelDeskOfficer: "Officer 23",
          })
        const travelDeskTravelRequest24 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[23] })
          .create({
            travelDeskOfficer: "Officer 24",
          })
        const travelDeskTravelRequest25 = await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[24] })
          .create({
            travelDeskOfficer: "Officer 25",
          })
        const selectedIds = [
          travelDeskTravelRequest1.id,
          travelDeskTravelRequest2.id,
          travelDeskTravelRequest3.id,
          travelDeskTravelRequest4.id,
          travelDeskTravelRequest5.id,
          travelDeskTravelRequest6.id,
          travelDeskTravelRequest7.id,
          travelDeskTravelRequest8.id,
          travelDeskTravelRequest9.id,
          travelDeskTravelRequest10.id,
          travelDeskTravelRequest11.id,
          travelDeskTravelRequest12.id,
          travelDeskTravelRequest13.id,
          travelDeskTravelRequest14.id,
          travelDeskTravelRequest15.id,
          travelDeskTravelRequest16.id,
          travelDeskTravelRequest17.id,
          travelDeskTravelRequest18.id,
          travelDeskTravelRequest19.id,
          travelDeskTravelRequest20.id,
          travelDeskTravelRequest21.id,
          travelDeskTravelRequest22.id,
          travelDeskTravelRequest23.id,
          travelDeskTravelRequest24.id,
          travelDeskTravelRequest25.id,
        ]
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

      test("when no IDs are specified, it exports every visible request beyond a list page in the requested order", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Jane",
          lastName: "Traveller",
          department: "Finance",
          branch: "Travel",
        })
        mockCurrentUser(user1)
        const requestCount = 16
        const travelAuthorizations = await travelAuthorizationFactory
          .associations({ user: user1 })
          .createList(requestCount)
        const draftTravelDeskTravelRequestFactory = travelDeskTravelRequestFactory.params({
          createdAt: new Date("2026-10-01T12:00:00.000Z"),
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[0] })
          .create({
            travelDeskOfficer: "Officer 01",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[1] })
          .create({
            travelDeskOfficer: "Officer 02",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[2] })
          .create({
            travelDeskOfficer: "Officer 03",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[3] })
          .create({
            travelDeskOfficer: "Officer 04",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[4] })
          .create({
            travelDeskOfficer: "Officer 05",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[5] })
          .create({
            travelDeskOfficer: "Officer 06",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[6] })
          .create({
            travelDeskOfficer: "Officer 07",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[7] })
          .create({
            travelDeskOfficer: "Officer 08",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[8] })
          .create({
            travelDeskOfficer: "Officer 09",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[9] })
          .create({
            travelDeskOfficer: "Officer 10",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[10] })
          .create({
            travelDeskOfficer: "Officer 11",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[11] })
          .create({
            travelDeskOfficer: "Officer 12",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[12] })
          .create({
            travelDeskOfficer: "Officer 13",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[13] })
          .create({
            travelDeskOfficer: "Officer 14",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[14] })
          .create({
            travelDeskOfficer: "Officer 15",
          })
        await draftTravelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorizations[15] })
          .create({
            travelDeskOfficer: "Officer 16",
          })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        const hiddenTravelAuthorization = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: hiddenTravelAuthorization })
          .create({ travelDeskOfficer: "Hidden Officer" })
        const query = qs.stringify({
          format: "csv",
          order: [
            ["travelStartDate", "ASC"],
            ["id", "DESC"],
          ],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests")
          .query(query)
          .type("form")
          .send({})
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

      test("when a large form selection includes inaccessible and unselected requests, it exports only selected policy-visible rows", async () => {
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
        const travelAuthorization3 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization3 })
          .create({ travelDeskOfficer: "Unselected Officer" })
        const selectedIds = [
          ownRequest.id,
          foreignRequest.id,
          ...Array.from({ length: 998 }, (_, index) => NONEXISTENT_REQUEST_ID + index),
        ]
        const query = qs.stringify({ where: { id: selectedIds } })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .type("form")
          .send({ query })
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

      test("when sort values tie, it groups unbooked requests and current-user assignments like the list", async () => {
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
        const request1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: "Other Officer",
          })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const request2 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: user1.displayName,
          })
        const travelAuthorization3 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const request3 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization3 })
          .create({
            createdAt: new Date("2026-10-01T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.BOOKED,
            travelDeskOfficer: user1.displayName,
          })
        const query = qs.stringify({
          where: { id: [request1.id, request2.id, request3.id] },
          order: [["createdAt", "ASC"]],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .type("form")
          .send({ query })
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
            "Travel Desk Officer": "Jane Traveller",
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
            "Travel Desk Officer": "Other Officer",
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
            Status: "Booked",
            "Travel Desk Officer": "Jane Traveller",
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
