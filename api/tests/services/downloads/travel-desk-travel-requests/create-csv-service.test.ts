import { isUndefined } from "lodash"
import Papa from "papaparse"

import { TravelDeskTravelRequest, User } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"

describe("api/src/services/downloads/travel-desk-travel-requests/create-csv-service.ts", () => {
  describe("CreateCsvService", () => {
    describe(".perform", () => {
      test("when request fields contain formula text and CSV delimiters, it writes a safe escaped CSV file", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: 'Élodie, "Anne"',
          lastName: "Applicant",
          department: " \t=SUM(A1:A2)",
          branch: "North,\r\nYukon",
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({
            createdAt: new Date("2026-10-23T12:00:00.000Z"),
            status: TravelDeskTravelRequest.Statuses.DRAFT,
            travelDeskOfficer: null,
          })
        const scopedTravelDeskTravelRequests = TravelDeskTravelRequestsPolicy.applyScope([], user1)

        // Act
        const csvBuffer = await CreateCsvService.perform(
          scopedTravelDeskTravelRequests,
          { id: travelDeskTravelRequest.id },
          undefined,
          user1
        )
        if (isUndefined(csvBuffer)) {
          throw new Error("Expected a CSV download for the visible request")
        }
        const parsedCsv = Papa.parse<Record<string, string>>(csvBuffer.toString("utf-8"), {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(parsedCsv.data).toEqual([
          {
            "Submit Date": "2026-10-23",
            Name: 'Élodie, "Anne" Applicant',
            Department: "' \t=SUM(A1:A2)",
            Branch: "North,\r\nYukon",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Draft",
            "Travel Desk Officer": "",
          },
        ])
      })
    })
  })
})
