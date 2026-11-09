import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { TravelDeskOtherTransportation } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskOtherTransportationFactory = Factory.define<TravelDeskOtherTransportation>(
  ({ associations, onCreate }) => {
    onCreate(async (travelDeskOtherTransportation) => {
      try {
        await nestedSaveAndAssociateIfNew(travelDeskOtherTransportation)
        return travelDeskOtherTransportation
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskOtherTransportation with attributes: ${JSON.stringify(
            travelDeskOtherTransportation.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelRequest =
      associations.travelRequest ?? travelDeskTravelRequestFactory.build({ id: undefined })

    const travelDeskOtherTransportation = TravelDeskOtherTransportation.build({
      travelRequestId: travelRequest.id,
      depart: faker.location.city(),
      arrive: faker.location.city(),
      transportationType: faker.helpers.enumValue(
        TravelDeskOtherTransportation.TransportationTypes
      ),
      date: faker.date.future(),
      additionalNotes: null,
      status: TravelDeskOtherTransportation.Statuses.REQUESTED,
      reservedTransportationInfo: null,
      booking: null,
    })

    travelDeskOtherTransportation.travelRequest = travelRequest

    return travelDeskOtherTransportation
  }
)

export default travelDeskOtherTransportationFactory
