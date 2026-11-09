import { TravelAuthorization, TravelDeskQuestion, TravelDeskTravelRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskQuestionFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-questions-controller.ts", () => {
  describe("TravelDeskQuestionsController", () => {
    describe("#create", () => {
      test("when a supervisor manages a submitted request, it permits creating a question", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          user: user1,
          supervisorEmail: user2.email,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.SUBMITTED })
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
          travelDeskQuestion: {
            id: expect.any(Number),
            travelRequestId: travelDeskTravelRequest.id,
            requestType: "flight",
            question: "Window or aisle?",
            response: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })
      })
    })

    describe("#update", () => {
      test("when the owner answers during options review, it preserves the question and request identity", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          user,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED })
        const question = await travelDeskQuestionFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
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
          travelDeskQuestion: {
            id: question.id,
            travelRequestId: travelDeskTravelRequest.id,
            requestType: "flight",
            question: "Window or aisle?",
            response: "Window, please.",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })
      })

      test("when a supervisor manages options review, it permits updating question details", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization1 = await travelAuthorizationFactory.create({
          user: user1,
          supervisorEmail: user2.email,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED })
        const travelDeskQuestion1 = await travelDeskQuestionFactory
          .associations({ travelRequest: travelDeskTravelRequest1 })
          .create({
            requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
            question: "Window or aisle?",
          })
        mockCurrentUser(user2)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-questions/${travelDeskQuestion1.id}`)
          .send({
            requestType: TravelDeskQuestion.RequestTypes.HOTEL,
            question: "Is an accessible room required?",
            response: "Yes, please.",
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskQuestion: {
            id: travelDeskQuestion1.id,
            travelRequestId: travelDeskTravelRequest1.id,
            requestType: "hotel",
            question: "Is an accessible room required?",
            response: "Yes, please.",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })
      })

      test("when the owner has finished options review, it rejects further response updates", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          user,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_RANKED })
        const question = await travelDeskQuestionFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
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
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          user: user2,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED })
        const question = await travelDeskQuestionFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            requestType: TravelDeskQuestion.RequestTypes.FLIGHT,
            question: "Window or aisle?",
          })
        mockCurrentUser(user1)

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

    describe("#destroy", () => {
      test("when the owner can only answer review questions, it rejects deleting a question", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          user,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED })
        const question = await travelDeskQuestionFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
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
