import { TravelAuthorization, TravelDeskQuestion, TravelDeskTravelRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-questions-controller.ts", () => {
  describe("TravelDeskQuestionsController", () => {
    describe("create", () => {
      test("when a supervisor manages a submitted request, it permits creating a question", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user1.id,
          supervisorEmail: user2.email,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.SUBMITTED,
        })
        mockCurrentUser(user2)

        // Act
        const response = await request().post("/api/travel-desk-questions").send({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskQuestion: expect.objectContaining({
            travelRequestId: travelDeskTravelRequest.id,
            requestType: "flight",
            question: "Window or aisle?",
            response: null,
          }),
        })
      })
    })

    describe("update", () => {
      test("when the owner answers during options review, it preserves the question and request identity", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
        })
        const question = await TravelDeskQuestion.create({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        mockCurrentUser(user)

        // Act
        const response = await request().patch(`/api/travel-desk-questions/${question.id}`).send({
          response: "Window, please.",
          question: "Replacement question",
          requestType: TravelDeskQuestion.RequestTypes.HOTEL,
          travelRequestId: 999,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskQuestion: expect.objectContaining({
            id: question.id,
            travelRequestId: travelDeskTravelRequest.id,
            requestType: "flight",
            question: "Window or aisle?",
            response: "Window, please.",
          }),
        })
      })

      test("when the owner has finished options review, it rejects further response updates", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_RANKED,
        })
        const question = await TravelDeskQuestion.create({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-questions/${question.id}`)
          .send({ response: "Window, please." })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel desk question.",
        })
      })

      test("when another traveller tries to answer, it rejects the update", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const otherUser = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: otherUser.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
        })
        const question = await TravelDeskQuestion.create({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-questions/${question.id}`)
          .send({ response: "Window, please." })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel desk question.",
        })
      })
    })

    describe("destroy", () => {
      test("when the owner can only answer review questions, it rejects deleting a question", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
        })
        const question = await TravelDeskQuestion.create({
          travelRequestId: travelDeskTravelRequest.id,
          requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
          question: "Window or aisle?",
        })
        mockCurrentUser(user)

        // Act
        const response = await request().delete(`/api/travel-desk-questions/${question.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to delete this travel desk question.",
        })
      })
    })
  })
})
