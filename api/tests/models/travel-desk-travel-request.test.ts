import { TravelDeskTravelRequest } from "@/models"
import { ValidationError } from "@sequelize/core"

describe("api/src/models/travel-desk-travel-request.ts", () => {
  describe("TravelDeskTravelRequest", () => {
    describe("validations - allInternationalTravelFieldsOrNone", () => {
      test("when is international travel, and passport country and passport number are not null, it is valid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: true,
          passportCountry: "India",
          passportNum: "123456",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).resolves.toBeTruthy()
      })

      test("when is international travel, and passport country is null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: true,
          passportCountry: null,
          passportNum: "123456",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Passport country and number are required for international travel/
        )
      })

      test("when is international travel, and passport number is null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: true,
          passportCountry: "India",
          passportNum: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Passport country and number are required for international travel/
        )
      })

      test("when is not international travel, and passport country and passport number are null, it is valid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: false,
          passportCountry: null,
          passportNum: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).resolves.toBeTruthy()
      })

      test("when is not international travel, and passport country is not null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: false,
          passportCountry: "India",
          passportNum: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Passport country and number are only permitted for international travel/
        )
      })

      test("when is not international travel, and passport number is not null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          isInternationalTravel: false,
          passportCountry: null,
          passportNum: "123456",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Passport country and number are only permitted for international travel/
        )
      })
    })

    describe("validations - allTravelContactFieldsOrNone", () => {
      test("when travel contact enabled, and travel contact email and travel contact phone are not null, it is valid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: true,
          travelEmail: "Jon.Doe@test.com",
          travelPhone: "1234567890",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).resolves.toBeTruthy()
      })

      test("when travel contact enabled, and travel contact email is null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: true,
          travelEmail: null,
          travelPhone: "1234567890",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Travel phone and email are required if travel contact is true/
        )
      })

      test("when travel contact enabled, and travel contact phone is null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: true,
          travelEmail: "John.Doe@test.com",
          travelPhone: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Travel phone and email are required if travel contact is true/
        )
      })

      test("when travel contact disabled, and travel contact email and travel contact phone are null, it is valid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: false,
          travelEmail: null,
          travelPhone: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).resolves.toBeTruthy()
      })

      test("when travel contact disabled, and travel contact email is not null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: false,
          travelEmail: "John.Doe@test.com",
          travelPhone: null,
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Travel phone and email are only permitted if travel contact is true/
        )
      })

      test("when travel contact disabled, and travel contact phone is not null, it is invalid", async () => {
        const travelDeskTravelRequest = new TravelDeskTravelRequest({
          travelContact: false,
          travelEmail: null,
          travelPhone: "1234567890",
          // Other fields that are not relevant for this test
          travelAuthorizationId: -1,
          legalFirstName: "Not relevant",
          legalLastName: "Not relevant",
          strAddress: "Not relevant",
          city: "Not relevant",
          province: "Not relevant",
          postalCode: "Not relevant",
          travelPurpose: "Not relevant",
          busPhone: "Not relevant",
          busEmail: "Not relevant",
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })

        expect.assertions(1)
        await expect(travelDeskTravelRequest.validate()).rejects.toThrow(
          /Travel phone and email are only permitted if travel contact is true/
        )
      })
    })
  })
})
