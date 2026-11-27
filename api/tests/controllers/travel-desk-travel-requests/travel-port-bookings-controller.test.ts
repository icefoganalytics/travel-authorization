import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"
import remoteDatabase from "@/integrations/travel-port-integration/db/db-client"
import { User } from "@/models"

import { mockCurrentUser, request } from "@/support"
import { travelDeskTravelRequestFactory, userFactory } from "@/factories"

describe("api/src/controllers/travel-desk-travel-requests/travel-port-bookings-controller.ts", () => {
  describe("TravelPortBookingsController", () => {
    beforeEach(async () => {
      // These source identifiers belong only to this suite; the source is not cleaned globally.
      await sourceDatabase("TravelOrderEvent")
        .whereBetween("TravelOrderIdentifier", [980001, 980010])
        .del()
    })

    describe.each([
      { method: "get", suffix: "travel-port-bookings" },
      { method: "put", suffix: "travel-port-booking" },
    ] as const)("$method $suffix", ({ method, suffix }) => {
      test("when the user lacks Travel Desk access, it denies the operation", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)
        const message =
          method === "get"
            ? "You are not authorized to access booking sources."
            : "You are not authorized to link Travelport bookings."

        // Act
        const response = await request()
          [method](`/api/travel-desk-travel-requests/` + travelRequest.id + `/` + suffix)
          .send({ recordLocator: "INVALID" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({ message })
      })

      test("when the parent is missing, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({ force: true })
        mockCurrentUser(user)

        // Act
        const response = await request()[method](
          `/api/travel-desk-travel-requests/` + travelRequest.id + `/` + suffix
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk travel request not found." })
      })

      test("when the remote source fails, it reports source unavailability", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)
        vi.spyOn(remoteDatabase, "query").mockRejectedValue(new Error("Source offline."))

        // Act
        const response = await request()
          [method](`/api/travel-desk-travel-requests/` + travelRequest.id + `/` + suffix)
          .send({ recordLocator: "Z98001" })

        // Assert
        expect(response.status).toEqual(503)
        expect(response.body).toEqual({ message: "Booking source is unavailable." })
      })
    })

    describe("index", () => {
      test.each([
        { page: 1, travelPortBookings: [{ recordLocator: "Z98001" }] },
        { page: 2, travelPortBookings: [{ recordLocator: "Z98002" }] },
        { page: 3, travelPortBookings: [] },
      ])(
        "when page $page is requested, it returns distinct canonical locators in order",
        async ({ page, travelPortBookings }) => {
          // Arrange
          const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(user)
          await sourceDatabase("TravelOrderEvent").insert([
            {
              TravelOrderIdentifier: 980001,
              RecordLocator: "Z98002",
              DatabaseTimeStamp: "2030-01-01",
            },
            {
              TravelOrderIdentifier: 980002,
              RecordLocator: "Z98001",
              DatabaseTimeStamp: "2030-01-01",
            },
            {
              TravelOrderIdentifier: 980003,
              RecordLocator: "z98001",
              DatabaseTimeStamp: "2030-01-01",
            },
            {
              TravelOrderIdentifier: 980004,
              RecordLocator: "OTHER1",
              DatabaseTimeStamp: "2030-01-01",
            },
            {
              TravelOrderIdentifier: 980005,
              RecordLocator: "Z98?01",
              DatabaseTimeStamp: "2030-01-01",
            },
            { TravelOrderIdentifier: 980006, RecordLocator: null, DatabaseTimeStamp: "2030-01-01" },
            {
              TravelOrderIdentifier: 980007,
              RecordLocator: "Z98",
              DatabaseTimeStamp: "2030-01-01",
            },
          ])

          // Act
          const response = await request()
            .get(`/api/travel-desk-travel-requests/` + travelRequest.id + "/travel-port-bookings")
            .query({ search: " z98 ", page, perPage: 1 })

          // Assert
          expect(response.status).toEqual(200)
          expect(response.body).toEqual({ travelPortBookings, totalCount: 2 })
        }
      )

      test.each([
        { search: "%" },
        { search: "_" },
        { search: "' OR 1=1" },
        { search: ["Z98", "Z99"] },
        { search: { value: "Z98" } },
      ])("when search is $search, it rejects invalid prefixes", async ({ search }) => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)
        const message =
          typeof search === "string"
            ? "Booking search must contain at most six letters or numbers."
            : "Booking search must be a locator prefix."

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/` + travelRequest.id + "/travel-port-bookings")
          .query({ search })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message })
      })
    })

    describe("update", () => {
      test("when the selected source event was deleted, it rejects the stale selection", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "KEEP01",
        })
        mockCurrentUser(user)
        await sourceDatabase("TravelOrderEvent").insert({
          TravelOrderIdentifier: 980001,
          RecordLocator: "Z98001",
          DatabaseTimeStamp: "2030-01-01",
        })
        await sourceDatabase("TravelOrderEvent").where("TravelOrderIdentifier", 980001).del()

        // Act
        const response = await request()
          .put(`/api/travel-desk-travel-requests/` + travelRequest.id + "/travel-port-booking")
          .send({ recordLocator: "Z98001" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Travelport booking no longer exists. Choose another booking.",
        })
      })

      test.each([undefined, "", "INVALID", ["Z98001"], { value: "Z98001" }])(
        "when the selection is %j, it rejects invalid input",
        async (recordLocator) => {
          // Arrange
          const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(user)

          // Act
          const response = await request()
            .put(`/api/travel-desk-travel-requests/` + travelRequest.id + "/travel-port-booking")
            .send({ recordLocator })

          // Assert
          expect(response.status).toEqual(422)
          expect(response.body).toEqual({
            message: "Record locator must contain six letters or numbers.",
          })
        }
      )

      test.each([User.Roles.ADMIN, User.Roles.TRAVEL_DESK_USER])(
        "when %s selects a real booking, it accepts the link",
        async (role) => {
          // Arrange
          const user = await userFactory.create({ roles: [role] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(user)
          await sourceDatabase("TravelOrderEvent").insert({
            TravelOrderIdentifier: 980001,
            RecordLocator: "Z98001",
            DatabaseTimeStamp: "2030-01-01",
          })

          // Act
          const response = await request()
            .put(`/api/travel-desk-travel-requests/` + travelRequest.id + "/travel-port-booking")
            .send({ recordLocator: " z98001 " })

          // Assert
          expect(response.status).toEqual(204)
          expect(response.body).toEqual({})
        }
      )
    })
  })
})
