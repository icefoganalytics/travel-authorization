import Papa from "papaparse"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { TravelDeskTravelRequest, User } from "@/models"

import { mockCurrentUser, request } from "@/support"

const SELECTED_REQUEST_COUNT = 12
const NONEXISTENT_REQUEST_ID = 999999999

describe("api/src/controllers/downloads/travel-desk-travel-requests-controller.ts", () => {
  describe("TravelDeskTravelRequestsController", () => {
    describe("#create", () => {
      test("when exporting twelve selected requests, it returns every row in stable order with escaped CSV fields", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        await user1.update({
          firstName: 'Élodie, "Anne"\nApplicant',
          lastName: "Yukon",
          department: "=1+1",
          branch: "Branch,\r\nÉquipe",
        })
        mockCurrentUser(user1)

        const selectedIds: number[] = []
        const expectedOfficerNames: string[] = []
        for (let requestIndex = 0; requestIndex < SELECTED_REQUEST_COUNT; requestIndex += 1) {
          const travelAuthorization = await travelAuthorizationFactory
            .associations({ user: user1 })
            .create()
          let status = TravelDeskTravelRequest.Statuses.DRAFT
          let travelDeskOfficer: string | null =
            `Officer ${String(requestIndex + 1).padStart(2, "0")}`

          if (requestIndex === 0) {
            status = TravelDeskTravelRequest.Statuses.SUBMITTED
            travelDeskOfficer = null
          } else if (requestIndex === 1) {
            status = TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
          }

          const travelDeskTravelRequest = await travelDeskTravelRequestFactory
            .associations({ travelAuthorization })
            .create({ status, travelDeskOfficer })
          selectedIds.push(travelDeskTravelRequest.id)
          expectedOfficerNames.push(travelDeskOfficer ?? "")
        }

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .send({ travelDeskTravelRequestIds: [...selectedIds].reverse() })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.headers["content-disposition"]).toMatch(
          /^attachment; filename="Export, Travel Desk Requests, \d{4}-\d{2}-\d{2}\.csv"$/
        )
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        expect(parsedCsv.meta.fields).toEqual([
          "Submit Date",
          "Name",
          "Department",
          "Branch",
          "Travel Start Date",
          "Travel End Date",
          "Location",
          "Requested",
          "Status",
          "Travel Desk Officer",
        ])
        expect(parsedCsv.data).toHaveLength(SELECTED_REQUEST_COUNT)
        expect(parsedCsv.data.map((row) => row["Travel Desk Officer"])).toEqual(
          expectedOfficerNames
        )
        expect(parsedCsv.data[0]).toEqual({
          "Submit Date": expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          Name: 'Élodie, "Anne"\nApplicant Yukon',
          Department: "'=1+1",
          Branch: "Branch,\r\nÉquipe",
          "Travel Start Date": "",
          "Travel End Date": "",
          Location: "",
          Requested: "",
          Status: "Not Started",
          "Travel Desk Officer": "",
        })
        expect(parsedCsv.data[1]["Status"]).toEqual("Options Provided")
      })

      test("when a native form sends a JSON-encoded selected ID array, it returns that request", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Form",
          lastName: "Traveller",
        })
        mockCurrentUser(user1)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .type("form")
          .send({ travelDeskTravelRequestIds: JSON.stringify([travelDeskTravelRequest.id]) })

        // Assert
        expect(response.status).toEqual(200)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })
        expect(parsedCsv.data).toEqual([
          expect.objectContaining({
            Name: "Form Traveller",
            Status: "Draft",
          }),
        ])
      })

      test("when selection includes a request outside the user's policy scope, it returns a generic not-found response", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const ownRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create()
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        const foreignRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create()

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .send({
            travelDeskTravelRequestIds: [ownRequest.id, foreignRequest.id],
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel requests were not found",
        })
      })

      test("when selection contains a nonexistent request ID, it returns a generic not-found response", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .send({ travelDeskTravelRequestIds: [NONEXISTENT_REQUEST_ID] })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel requests were not found",
        })
      })

      test("when PDF selection contains a request outside the user's policy scope, it returns not found without generating a PDF", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        const foreignRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=pdf")
          .send({ travelDeskTravelRequestIds: [foreignRequest.id] })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel requests were not found",
        })
      })

      test("when the selected request list is empty, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .send({ travelDeskTravelRequestIds: [] })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Invalid travel desk travel request selection",
        })
      })

      test("when selected IDs are not valid JSON, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=csv")
          .send({ travelDeskTravelRequestIds: "not-json" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Invalid travel desk travel request selection",
        })
      })

      test("when a format is not supported, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-desk-travel-requests?format=json")
          .send({ travelDeskTravelRequestIds: [1] })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Unsupported report format",
        })
      })
    })
  })
})
