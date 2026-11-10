import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelDeskQuestion } from "@/models"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskQuestionFactory = FactoryShark.define(
  TravelDeskQuestion,
  ({ associate }) => {
    associate("travelRequest", travelDeskTravelRequestFactory)

    return {
      requestType: faker.helpers.enumValue(TravelDeskQuestion.RequestTypes),
      question: faker.lorem.sentence(),
      response: null,
    }
  }
)

export default travelDeskQuestionFactory
