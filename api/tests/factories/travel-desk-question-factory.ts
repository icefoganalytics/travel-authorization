import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { TravelDeskQuestion } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskQuestionFactory = Factory.define<TravelDeskQuestion>(
  ({ associations, onCreate }) => {
    onCreate(async (travelDeskQuestion) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskQuestion)
        return travelDeskQuestion
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskQuestion with attributes: ${JSON.stringify(
            travelDeskQuestion.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelRequest =
      associations.travelRequest ?? travelDeskTravelRequestFactory.build({ id: undefined })

    const travelDeskQuestion = TravelDeskQuestion.build({
      travelRequestId: travelRequest.id,
      requestType: faker.helpers.enumValue(TravelDeskQuestion.RequestTypes),
      question: faker.lorem.sentence(),
      response: null,
    })

    travelDeskQuestion.travelRequest = travelRequest

    return travelDeskQuestion
  }
)

export default travelDeskQuestionFactory
