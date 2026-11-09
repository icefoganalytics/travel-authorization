import { TravelDeskQuestion, TravelDeskTravelRequest, User } from "@/models"

import TravelDeskQuestionsPolicy from "@/policies/travel-desk-questions-policy"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

describe("api/src/policies/travel-desk-questions-policy.ts", () => {
  describe("TravelDeskQuestionsPolicy", () => {
    describe("#permitAttributesForUpdate", () => {
      test("when a travel desk user has no relationship to the request, it permits no question edits", () => {
        // Arrange
        const user = userFactory.build({
          id: 42,
          email: "travel-desk@example.test",
          roles: [User.Roles.TRAVEL_DESK_USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          id: 287,
          userId: 43,
          supervisorEmail: "supervisor@example.test",
        })
        const travelDeskTravelRequest = travelDeskTravelRequestFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          id: 900,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization
        const question = TravelDeskQuestion.build({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        question.travelRequest = travelDeskTravelRequest
        const policy = new TravelDeskQuestionsPolicy(user, question)

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate({
          travelRequestId: 999,
          requestType: "hotel",
          question: "Replacement question",
          response: "Window",
        })

        // Assert
        expect(permittedAttributes).toEqual({})
      })

      test("when the request owner is also an administrator, it retains question management during options review", () => {
        // Arrange
        const user = userFactory.build({
          id: 42,
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          id: 287,
          userId: user.id,
        })
        const travelDeskTravelRequest = travelDeskTravelRequestFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          id: 900,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization
        const question = TravelDeskQuestion.build({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        question.travelRequest = travelDeskTravelRequest
        const policy = new TravelDeskQuestionsPolicy(user, question)

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate({
          travelRequestId: 999,
          requestType: "hotel",
          question: "Preferred hotel?",
          response: "Conference hotel",
        })

        // Assert
        expect(permittedAttributes).toEqual({
          requestType: "hotel",
          question: "Preferred hotel?",
          response: "Conference hotel",
        })
      })
    })
  })
})
