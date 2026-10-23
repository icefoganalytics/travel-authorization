import { TravelDeskTravelRequest, User } from "@/models"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import { ReportSerializer } from "@/serializers/travel-desk-travel-requests/report-serializer"

describe("api/src/serializers/travel-desk-travel-requests/report-serializer.ts", () => {
  describe("ReportSerializer", () => {
    describe(".perform", () => {
      test("when requests are submitted or have travel options, it formats report dates, fields, and statuses", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          firstName: "Élodie",
          lastName: "Yukon",
          department: "Finance",
          branch: "Northern Services",
        })
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const submittedRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({
            status: TravelDeskTravelRequest.Statuses.SUBMITTED,
            travelDeskOfficer: null,
            createdAt: new Date("2026-08-17T23:30:00.000Z"),
          })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const optionsProvidedRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({
            status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
            travelDeskOfficer: "Travel Desk Officer",
          })
        const loadedRequests = await TravelDeskTravelRequest.findAll({
          where: { id: [submittedRequest.id, optionsProvidedRequest.id] },
          order: [["id", "ASC"]],
          include: [
            "flightRequests",
            "hotels",
            "otherTransportations",
            "passengerNameRecordDocument",
            "rentalCars",
            {
              association: "travelAuthorization",
              required: true,
              include: [
                "user",
                {
                  association: "travelSegments",
                  separate: true,
                  order: [["segmentNumber", "ASC"]],
                  include: ["departureLocation", "arrivalLocation"],
                },
              ],
            },
          ],
        })

        // Act
        const reportRows = ReportSerializer.perform(loadedRequests, user1)

        // Assert
        expect(reportRows).toEqual([
          {
            "Submit Date": "2026-08-17",
            Name: "Élodie Yukon",
            Department: "Finance",
            Branch: "Northern Services",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Not Started",
            "Travel Desk Officer": "",
          },
          {
            "Submit Date": expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            Name: "Élodie Yukon",
            Department: "Finance",
            Branch: "Northern Services",
            "Travel Start Date": "",
            "Travel End Date": "",
            Location: "",
            Requested: "",
            Status: "Options Provided",
            "Travel Desk Officer": "Travel Desk Officer",
          },
        ])
      })

      test("when a booked request has no officer, preserves its booked status", async () => {
        // Arrange
        const user1 = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({
            status: TravelDeskTravelRequest.Statuses.BOOKED,
            travelDeskOfficer: null,
          })
        await travelDeskTravelRequest.reload({
          include: [
            "passengerNameRecordDocument",
            {
              association: "travelAuthorization",
              include: ["user", "travelSegments"],
            },
          ],
        })

        // Act
        const reportRow = ReportSerializer.perform(travelDeskTravelRequest, user1)

        // Assert
        expect(reportRow.Status).toBe("Booked")
      })
    })
  })
})
