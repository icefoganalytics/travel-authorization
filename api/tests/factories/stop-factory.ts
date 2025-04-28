import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { Stop } from "@/models"
import { locationFactory, travelAuthorizationFactory } from "@/factories"
import { anytime, nestedSaveAndAssociateIfNew } from "@/factories/helpers"

export const stopFactory = Factory.define<Stop>(({ associations, onCreate }) => {
  onCreate(async (stop) => {
    try {
      await nestedSaveAndAssociateIfNew(stop)
      return stop
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create Stop with attributes: ${JSON.stringify(stop.dataValues, null, 2)}`
      )
    }
  })

  const stop = Stop.build({
    departureDate: faker.date.soon(),
    departureTime: anytime(),
    transport: faker.helpers.arrayElement(Object.values(Stop.TravelMethods)),
    accommodationType: faker.helpers.arrayElement(Object.values(Stop.AccommodationTypes)),
    isActual: false,
  })
  stop.travelAuthorization = associations.travelAuthorization ?? travelAuthorizationFactory.build()
  stop.location = associations.location ?? locationFactory.build()
  return stop
})

export default stopFactory
